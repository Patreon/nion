import get from 'lodash.get'
import map from 'lodash.map'
import set from 'lodash.set'

import nionActions from '../actions'
import { makeRef } from '../transforms'
import ApiManager from '../api'
import ExtensionManager from '../extensions'
import { INITIALIZE_DATAKEY, UPDATE_REF } from '../actions/types'
import { selectResourcesForKeys } from '../selectors'
import processDefaultOptions from '../declarations/process-default-options'

import clone from '../utilities/clone'
import { defineNonEnumerable, getUrl } from '../decorator/utilities'

const processDeclarations = (inputDeclarations, ...rest) => {
    let declarations

    // The passed in declarations object is a map of dataKeys to fetch and their corresponding
    // params. We need to handle both the component-scoped key (the key of the object passed to
    // the decorator) as well as the dataKey that points to where the ref / request is stored on
    // the state tree
    const mapDeclarations = fn =>
        map(declarations, (declaration, key) =>
            fn(declaration, key, declaration.dataKey || key),
        )

    // Construct the nion selector to map to props
    const makeMapStateToProps = () => {
        const mapStateToProps = (state, ownProps) => {
            // Process the input declarations, ensuring we make a copy of the original argument to
            // prevent object reference bugs between instances of the decorated class
            declarations =
                inputDeclarations instanceof Function
                    ? inputDeclarations(ownProps)
                    : clone(inputDeclarations)

            // Otherwise, if the passed in declarartions are a string (shorthand dataKey selection),
            // create a declaration object
            if (typeof inputDeclarations === 'string') {
                declarations = {}
                map([inputDeclarations, ...rest], dataKey => {
                    declarations[dataKey] = {}
                })
            }

            // Apply default options to the declarations
            processDefaultOptions(declarations)

            // We want to pass in the selected data to the wrapped component by the key (ie pledge),
            // even though we may be storing the data on the store by an id-specific dataKey (ie
            // pledge:1234). We'll need to make a map from dataKey to key to handle passing the props
            // more semantically to the wrapped component. We'll need these dataKeys for creating our
            // selector as well.
            const keysByDataKey = {}
            const dataKeys = mapDeclarations((declaration, key, dataKey) => {
                // If the dataKey already exists in this group of declarations, throw an error!
                if (keysByDataKey[dataKey]) {
                    throw new Error(
                        'Duplicate dataKeys detected in this nion decorator',
                    )
                }

                keysByDataKey[dataKey] = key

                // Ensure the dataKey is set properly on the declaration
                declaration.dataKey = declaration.dataKey || key

                return dataKey
            })

            const selectedResources = selectResourcesForKeys(dataKeys, true)(
                state,
            )

            let nion = {}

            // Now map back over the dataKeys to their original keys
            map(selectedResources, (selected, selectedDataKey) => {
                const key = keysByDataKey[selectedDataKey]
                nion[key] = {}

                // If the ref doesn't yet exist, we need to ensure we can pass an object with
                // 'request' and 'actions' props to the child component so it can manage loading the
                // data. Therefore, we'll create a "NonExistentObject" (an empty object with a
                // hidden property) to pass down to the child component. This can interface with the
                // "exists" function to tell if the data exists yet
                const refDoesNotExist = selected.obj === undefined || null
                nion[key].data = refDoesNotExist ? null : selected.obj

                // Define the nion-specific properties as properties on the dataKey prop.
                nion[key].actions = {}
                nion[key].request = selected.request
                nion[key].extra = selected.extra
                nion[key].extensions = {}
            })

            return { nion }
        }
        return mapStateToProps
    }

    // Construct the dispatch methods to pass action creators to the component
    const mapDispatchToProps = (dispatch, ownProps) => {
        const dispatchProps = {}

        // Map over the supplied declarations to build out the 4 main methods to add to the actions
        // subprop, as well as the special case next method for paginated resources
        mapDeclarations((declaration, key, dataKey) => {
            dispatchProps[key] = {}
            const buildUrl = ApiManager.getBuildUrl(declaration.apiType)

            dispatchProps[key]['POST'] = (body = {}, params, actionOptions) => {
                const endpoint = getUrl(declaration, params, buildUrl)
                return nionActions.post(dataKey, {
                    endpoint,
                    declaration,
                    body,
                    meta: {
                        append: get(actionOptions, 'append'),
                    },
                })(dispatch)
            }

            dispatchProps[key]['PATCH'] = (body = {}, params) => {
                const endpoint = getUrl(declaration, params, buildUrl)
                return nionActions.patch(dataKey, {
                    endpoint,
                    declaration,
                    body,
                })(dispatch)
            }

            dispatchProps[key]['GET'] = (params, actionOptions = {}) => {
                const endpoint = getUrl(declaration, params, buildUrl)
                return nionActions.get(dataKey, {
                    declaration,
                    endpoint,
                    meta: {
                        append: get(actionOptions, 'append'),
                    },
                })(dispatch)
            }

            dispatchProps[key]['DELETE'] = (
                refToDelete = {},
                params,
                options = {},
            ) => {
                if (options.refToDelete) {
                    refToDelete = options.refToDelete
                }
                const endpoint = getUrl(declaration, params, buildUrl)
                return nionActions.delete(dataKey, {
                    declaration,
                    endpoint,
                    refToDelete,
                })(dispatch)
            }

            // Exposed, general nion data manipulating actions
            dispatchProps[key].updateRef = ref => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: UPDATE_REF,
                        payload: {
                            ref: makeRef(ref),
                        },
                        meta: {
                            dataKey: declaration.dataKey,
                        },
                    })
                    resolve()
                })
            }
        })

        // Private, internal nion data manipulating actions
        dispatchProps._initializeDataKey = (dataKey, ref) => {
            dispatch({
                type: INITIALIZE_DATAKEY,
                payload: { ref },
                meta: { dataKey },
            })
        }

        // Exposed, general nion data manipulating actions
        dispatchProps.updateEntity = ({ type, id }, attributes) => {
            return new Promise((resolve, reject) => {
                dispatch(nionActions.updateEntity({ type, id }, attributes))
                resolve()
            })
        }

        return dispatchProps
    }

    // Now, transform the dispatch props (<ref>Request) into methods on the nion.action prop
    const mergeProps = (stateProps, dispatchProps, ownProps) => {
        const nextProps = { ...stateProps, ...ownProps }

        mapDeclarations((declaration, key, dataKey) => {
            const resource = get(stateProps.nion, [key])
            const data = get(resource, ['data'])
            const ref = data ? { id: data.id, type: data.type } : null

            // Add each method's corresponding request handler to the nextProps[key].request
            // object
            const methods = ['GET', 'PATCH', 'POST']
            methods.forEach(method => {
                const dispatchFn = dispatchProps[key][method]
                set(
                    nextProps.nion,
                    [key, 'actions', method.toLowerCase()],
                    dispatchFn,
                )
            })

            // Handle deletion, where we're passing in the ref attached to the dataKey to be deleted
            const deleteDispatchFn = dispatchProps[key]['DELETE']
            const deleteFn = (props, options) =>
                deleteDispatchFn(ref, props, options)
            set(nextProps.nion, [key, 'actions', 'delete'], deleteFn)

            // Process extensions
            map(declaration.extensions, (options, extension) => {
                map(
                    ExtensionManager.composeActionsForExtension(
                        extension,
                        options,
                        resource,
                    ),
                    (action, actionKey) => {
                        set(
                            nextProps.nion,
                            [key, `extensions`, extension, actionKey],
                            action,
                        )
                    },
                )

                map(
                    ExtensionManager.composeMetaForExtension(
                        extension,
                        options,
                        resource,
                    ),
                    (metaValue, metaKey) => {
                        set(
                            nextProps.nion,
                            [key, `extensions`, extension, `meta`, metaKey],
                            metaValue,
                        )
                    },
                )
            })

            set(
                nextProps.nion,
                [key, 'actions', 'updateRef'],
                dispatchProps[key].updateRef,
            )
        })

        // Pass along the nion decorator-internal methods for initialization
        defineNonEnumerable(nextProps.nion, '_declarations', declarations)
        defineNonEnumerable(
            nextProps.nion,
            '_initializeDataKey',
            dispatchProps._initializeDataKey,
        )

        // Pass along the global nion action creators
        defineNonEnumerable(
            nextProps.nion,
            'updateEntity',
            dispatchProps.updateEntity,
        )

        return nextProps
    }

    return {
        makeMapStateToProps,
        mapDispatchToProps,
        mergeProps,
    }
}

export default processDeclarations
