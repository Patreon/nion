import React, { Component } from 'react'
import PropTypes from 'prop-types'
import difference from 'lodash.difference'
import get from 'lodash.get'
import map from 'lodash.map'
import set from 'lodash.set'

import { getUrl } from '../utilities/get-url'
import nionActions from '../actions'
import { makeRef } from '../transforms'
import ApiManager from '../api'
import Lifecycle from '../lifecycle'
import ExtensionManager from '../extensions'
import { areMergedPropsEqual } from './should-rerender'

import { connect } from 'react-redux'

import { INITIALIZE_DATAKEY, UPDATE_REF } from '../actions/types'
import { selectResourcesForKeys } from '../selectors'

const getDefaultDeclarationOptions = () => ({
    // Component / API Lifecycle methods
    fetchOnInit: false, // Should the component load the data when a new dataKey is created?
    fetchOnce: true, // Should the component only load the data once when dataKey is created?

    // Manual ref initialization, for parent/child data management relationships
    initialRef: null,

    // Compose basic actions and add handy custom meta values
    extensions: {},

    // Specify the API used to request and parse API data
    apiType: ApiManager.getDefaultApi(),

    // Set custom request parameters
    requestParams: {},
})

const processDefaultOptions = declarations => {
    map(declarations, (declaration, key) => {
        map(getDefaultDeclarationOptions(), (defaultState, defaultKey) => {
            const option = get(declaration, defaultKey, defaultState)
            declaration[defaultKey] = option
        })
    })
}

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

    // Construct the JSON API selector to map to props
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

            Lifecycle.onDeclare({ declarations, ownProps })

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

            const nion = {}

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

            dispatchProps[key]['POST'] = (body = {}, params, actionOptions) => {
                const endpoint = getUrl(declaration, params)

                return nionActions.post(dataKey, {
                    endpoint,
                    declaration,
                    body,
                    meta: {
                        append: get(actionOptions, 'append'),
                        appendKey: get(actionOptions, 'appendKey'),
                    },
                })(dispatch)
            }

            dispatchProps[key]['PATCH'] = (body = {}, params) => {
                const endpoint = getUrl(declaration, params)
                return nionActions.patch(dataKey, {
                    endpoint,
                    declaration,
                    body,
                })(dispatch)
            }

            dispatchProps[key]['GET'] = (params, actionOptions = {}) => {
                const endpoint = getUrl(declaration, params)
                return nionActions.get(dataKey, {
                    declaration,
                    endpoint,
                    meta: {
                        append: get(actionOptions, 'append'),
                        appendKey: get(actionOptions, 'appendKey'),
                    },
                })(dispatch)
            }

            dispatchProps[key]['PUT'] = (params, actionOptions = {}) => {
                const endpoint = getUrl(declaration, params)
                return nionActions.put(dataKey, {
                    declaration,
                    endpoint,
                    meta: {
                        append: get(actionOptions, 'append'),
                        appendKey: get(actionOptions, 'appendKey'),
                    },
                })(dispatch)
            }

            dispatchProps[key]['DELETE'] = (
                refToDelete = {},
                params,
                options = {},
            ) => {
                // TODO: Refactor ref to delete to not be mutative.
                if (options.refToDelete) {
                    refToDelete = options.refToDelete
                }
                const endpoint = getUrl(declaration, params)
                return nionActions.delete(dataKey, {
                    ...options,
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
            const methods = ['GET', 'PATCH', 'PUT', 'POST']
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

// JSON API decorator function for wrapping connected components to the new JSON API redux system
const nion = (declarations = {}, ...rest) => WrappedComponent => {
    const {
        makeMapStateToProps,
        mapDispatchToProps,
        mergeProps,
    } = processDeclarations(declarations, ...rest)

    // Track the status of fetch actions to avoid sending out duplicate requests, since props can
    // change multiple times before the redux store has updated (our nion actions are async)
    const fetchesByDataKey = {}

    class WithNion extends Component {
        static displayName = `WithNion(${getDisplayName(WrappedComponent)})`

        static propTypes = {
            nion: PropTypes.object.isRequired,
        }

        constructor(props) {
            super(props)
            this.initializeDataKeys(props)
        }

        componentWillReceiveProps(nextProps) {
            this.initializeDataKeys(nextProps)
        }

        fetchOnMount(props) {
            const { nion } = props // eslint-disable-line no-shadow

            // We want to trigger a fetch when the props change and lead to the creation of a new
            // dataKey, regardless of whether or not that happens as a result of a mount.
            map(nion._declarations, (declaration, key) => {
                // eslint-disable-line no-shadow
                // If not fetching on init, don't do anything
                if (!declaration.fetchOnInit) {
                    return
                }

                const fetch = nion[key].actions.get
                const status = nion[key].request.status
                const dataKey = declaration.dataKey

                // We need to manually check the status of the pending fetch action promise, since
                // parent components may send props multiple times to the wrapped component (ie
                // during setState). Because our redux actions are async, the redux store will not
                // be updated before the next componentWillReceiveProps, so looking at the redux
                // request status will be misleading because it will not have been updated
                const isFetchPending = !!fetchesByDataKey[dataKey]

                // If the fetch is only to be performed once, don't fetch if already loaded
                if (declaration.fetchOnce) {
                    if (isNotLoaded(status) && !isFetchPending) {
                        fetchesByDataKey[dataKey] = fetch().then(() => {
                            fetchesByDataKey[dataKey] = null
                        })
                    }
                } else {
                    if (isNotLoading(status) && !isFetchPending) {
                        fetchesByDataKey[dataKey] = fetch().then(() => {
                            fetchesByDataKey[dataKey] = null
                        })
                    }
                }
            })
        }

        initializeDataKeys(props) {
            const { nion } = props // eslint-disable-line no-shadow

            // Iterate over the declarations provided to the component, deciding how to manage the
            // load state of each one
            map(nion._declarations, (declaration, key) => {
                // eslint-disable-line no-shadow
                // If we're supplying a ref to be managed by nion, we'll want to attach it to the
                // state tree ahead of time (maybe not? maybe we want to have a "virtual" ref...
                // this is interesting)
                if (declaration.initialRef) {
                    // If a ref has already been attached to the dataKey, don't dispatch it again...
                    // this triggers a cascading rerender which will cause an infinite loop

                    if (exists(nion[key].data)) {
                        return
                    }

                    const { dataKey, initialRef } = declaration
                    return nion._initializeDataKey(dataKey, initialRef)
                }
            })
        }

        componentDidMount() {
            this.fetchOnMount(this.props)
        }

        render() {
            // Filter out internally used props to not expose them in the wrapped component
            const nextProps = {
                ...this.props,
                nion: finalProcessProps(this.props.nion),
            }

            return <WrappedComponent {...nextProps} />
        }
    }

    const connectedComponent = connect(
        makeMapStateToProps,
        mapDispatchToProps,
        mergeProps,
        {
            areMergedPropsEqual,
        },
    )(WithNion)
    // Take all static properties on the inner Wrapped component and put them on our now-connected
    // component. // This makes nion transparent and safe to add as a decorator; it does not occlude
    // the shape of the inner component.
    difference(
        Object.keys(WrappedComponent),
        Object.keys(connectedComponent),
    ).map(key => {
        connectedComponent[key] = WrappedComponent[key]
    })
    return connectedComponent
}

export default nion

// ----------------------------- Helper functions

// Test for the existence of a nion[key] object. If we don't yet have any data attached to a
// dataKey, nion will still pass down an empty object with "request" and "actions" props in order to
// manage loading the corresponding data. This method tests to see if that object has data
// associated with it.
export function exists(input = {}) {
    if (input === null || typeof input === 'undefined') {
        return false
    }

    if (typeof input.data !== 'undefined' && input.data === null) {
        return false
    }

    return true
}

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

function isNotLoading(status) {
    return status !== 'pending'
}

function isNotLoaded(status) {
    return status === 'not called'
}

// Filter out hidden props from the nion dataProp, including _declarations and _initializeDataKey,
// which are only used internally in the wrapper component. Expose a method getDeclarations that
// returns the removed declarations property
function finalProcessProps(nionProp) {
    const output = {}

    // Expose a getDeclarations method (used for testing) and updateEntity method (for optimistic
    // updates)
    output.getDeclarations = () => nionProp._declarations
    output.updateEntity = nionProp.updateEntity

    return { ...nionProp, ...output }
}

// Yes, a bit funny - but it turns out this is a safe, fast, and terse way of deep cloning data
function clone(input) {
    return JSON.parse(JSON.stringify(input))
}

function defineNonEnumerable(obj, key, value) {
    Object.defineProperty(obj, key, {
        value,
        enumerable: false,
    })
}
