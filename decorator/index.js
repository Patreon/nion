import React, { Component } from 'react'
import difference from 'lodash.difference'
import get from 'lodash.get'
import set from 'lodash.set'
import map from 'lodash.map'
import promiseActions from '../actions/promises'
import { makeRef } from '../transforms'
import ApiManager from '../api'

import { connect } from 'react-redux'

import { INITIALIZE_DATAKEY, UPDATE_ENTITY, UPDATE_REF } from '../actions/types'
import { selectResourcesForKeys } from '../selectors'

const defaultDeclarationOptions = {
    // Component / API Lifecycle methods
    fetchOnInit: false, // Should the component load the data when a new dataKey is created?
    fetchOnce: true, // Should the component only load the data once when dataKey is created?

    // Manual ref initialization, for parent/child data management relationships
    initialRef: null,

    // Special request type parameters
    paginated: false,

    // Specify the API used to request and parse API data
    apiType: ApiManager.getDefaultApi(),

    // Set custom request parameters
    requestParams: {}
}

function processDefaultOptions(declarations) {
    map(declarations, (declaration, key) => {
        map(defaultDeclarationOptions, (defaultState, defaultKey) => {
            const option = get(declaration, defaultKey, defaultState)
            declaration[defaultKey] = option
        })
    })
}

function processDeclarations(inputDeclarations, options) {
    let declarations

    function defineDataProperty(obj, key, value){
        Object.defineProperty(obj, key, {
            value,
            enumerable: false
        })
    }

    // The passed in declarations object is a map of dataKeys to fetch and their corresponding
    // params. We need to handle both the component-scoped key (the key of the object passed to
    // the decorator) as well as the dataKey that points to where the ref / request is stored on
    // the state tree
    const mapDeclarations = (fn) => (
        map(declarations, (declaration, key) => (
            fn(declaration, key, declaration.dataKey || key)
        ))
    )

    // Construct the JSON API selector to map to props
    const mapStateToProps = (state, ownProps) => {
        // Process the input declarations, ensuring we make a copy of the original argument to
        // prevent object reference bugs between instances of the decorated class
        declarations = inputDeclarations instanceof Function ?
            inputDeclarations(ownProps) : clone(inputDeclarations)

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
                throw new Error('Duplicate dataKeys detected in this nion decorator')
            }

            keysByDataKey[dataKey] = key

            // Ensure the dataKey is set properly on the declaration
            declaration.dataKey = declaration.dataKey || key

            return dataKey
        })

        const selectedResources = selectResourcesForKeys(dataKeys)(state)

        const nion = {}

        // Now map back over the dataKeys to their original keys
        map(selectedResources, (selected, selectedDataKey) => {
            const key = keysByDataKey[selectedDataKey]

            // If the ref doesn't yet exist, we need to ensure we can pass an object with
            // 'request' and 'actions' props to the child component so it can manage loading the
            // data. Therefore, we'll create a "NonExistentObject" (an empty object with a
            // hidden property) to pass down to the child component. This can interface with the
            // "exists" function to tell if the data exists yet
            const refDoesNotExist = selected.obj === undefined
            nion[key] = refDoesNotExist ?
                makeNonExistingObject() : makeExistingObject(selected.obj)

            // Define the nion-specific properties as non-enumerable properties on the dataKey prop.
            // TODO: links and meta are JSON-API specific properties on the reference that we need
            // to decide how to handle in an API-agnostic way
            defineDataProperty(nion[key], 'actions', {})
            defineDataProperty(nion[key], 'links', { ...selected.links })
            defineDataProperty(nion[key], 'meta', { ...selected.meta })
            defineDataProperty(nion[key], 'request', { ...selected.request })
        })

        return { nion }
    }

    // Construct the dispatch methods to pass action creators to the component
    const mapDispatchToProps = (dispatch, ownProps) => {
        const dispatchProps = {}

        // Helper method to construct a url endpoint from supplied declaration and params.
        // This will be used to build the endpoints for the various method actions
        function getUrl(declaration, params) {
            let endpoint = get(declaration, 'endpoint')
            const buildUrl = ApiManager.getBuildUrl(declaration.apiType)

            // If supplied endpoint override at call time, then use the supplied endpoint
            if (get(params, 'endpoint')) {
                endpoint = params.endpoint
            }

            // Use if a fully-formed url, otherwise pass to buildUrl
            return (
                typeof buildUrl === 'undefined' ||
                endpoint.indexOf('https://') === 0 ||
                endpoint.indexOf('http://') === 0
            ) ? endpoint : buildUrl(endpoint, params)
        }

        // Map over the supplied declarations to build out the 4 main methods to add to the actions
        // subprop, as well as the special case next method for paginated resources
        mapDeclarations((declaration, key, dataKey) => {
            dispatchProps[key] = {}

            dispatchProps[key]['POST'] = (data = {}, params) => {
                const endpoint = getUrl(declaration, params)
                return promiseActions.post(dataKey, {
                    endpoint,
                    body: { data },
                    declaration
                })(dispatch)
            }

            dispatchProps[key]['PATCH'] = (data = {}, params) => {
                const endpoint = getUrl(declaration, params)
                return promiseActions.patch(dataKey, {
                    endpoint,
                    body: { data },
                    declaration
                })(dispatch)
            }

            dispatchProps[key]['GET'] = (params) => {
                const endpoint = getUrl(declaration, params)
                return promiseActions.get(dataKey, {
                    endpoint,
                    declaration
                })(dispatch)
            }

            dispatchProps[key]['DELETE'] = (ref = {}, params) => {
                const endpoint = getUrl(declaration, params)
                return promiseActions.delete(dataKey, ref, {
                    endpoint,
                    declaration
                })(dispatch)
            }

            if (declaration.paginated) {
                dispatchProps[key]['NEXT'] = (params) => {
                    const { next } = params
                    const endpoint = params.endpoint || next

                    return promiseActions.next(dataKey, {
                        endpoint,
                        declaration
                    })(dispatch)
                }
            }

            // Exposed, general nion data manipulating actions
            dispatchProps[key].updateRef = (ref) => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: UPDATE_REF,
                        payload: { dataKey: declaration.dataKey, ref: makeRef(ref) }
                    })
                    resolve()
                })
            }
        })

        // Private, internal nion data manipulating actions
        dispatchProps._initializeDataKey = (dataKey, ref) => {
            dispatch({
                type: INITIALIZE_DATAKEY,
                payload: { dataKey, ref: makeRef(ref) }
            })
        }

        // Exposed, general nion data manipulating actions
        dispatchProps.updateEntity = ({ type, id }, attributes) => {
            return new Promise((resolve, reject) => {
                dispatch({
                    type: UPDATE_ENTITY,
                    payload: { type, id, attributes }
                })
                resolve()
            })
        }

        return dispatchProps
    }

    // Now, transform the dispatch props (<ref>Request) into methods on the nion.action prop
    function mergeProps(stateProps, dispatchProps, ownProps) {

        const nextProps = { ...stateProps, ...ownProps }

        mapDeclarations((declaration, key, dataKey) => {
            const data = get(stateProps.nion, key)
            const ref = data ? { id: data.id, type: data.type } : null

            // Add each method's corresponding request handler to the nextProps[key].request
            // object
            const methods = ['GET', 'PATCH', 'POST']
            methods.forEach(method => {
                const dispatchFn = dispatchProps[key][method]
                set(nextProps.nion, [key, 'actions', method.toLowerCase()], dispatchFn)
            })

            // Handle deletion, where we're passing in the ref attached to the dataKey to be deleted
            const deleteDispatchFn = dispatchProps[key]['DELETE']
            const deleteFn = (props) => deleteDispatchFn(ref, props)
            set(nextProps.nion, [key, 'actions', 'delete'], deleteFn)

            // Handle the special NEXT submethod, for paginated declarations
            if (dispatchProps[key]['NEXT']) {
                const dispatchFn = dispatchProps[key]['NEXT']
                const pagination = ApiManager.getPagination(declaration.apiType)

                const selectedData = get(stateProps.nion, key)
                const nextUrl = pagination(selectedData)

                if (nextUrl) {
                    const nextFn = (params) => dispatchFn({ ...params, next: nextUrl })
                    set(nextProps.nion, [key, 'actions', 'next'], nextFn)
                }
            }

            set(nextProps.nion, [key, 'actions', 'updateRef'], dispatchProps[key].updateRef)
        })

        if (dispatchProps._initializeDataKey) {
            nextProps.nion._initializeDataKey = dispatchProps._initializeDataKey
        }

        // Pass along the global nion action creators
        nextProps.nion.updateEntity = dispatchProps.updateEntity
        nextProps.nion._declarations = declarations

        return nextProps
    }

    return {
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
    }
}

// JSON API decorator function for wrapping connected components to the new JSON API redux system
const nion = (declarations = {}, options = {}) => (WrappedComponent) => {
    const {
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
    } = processDeclarations(declarations, options)

    // Track the status of fetch actions to avoid sending out duplicate requests, since props can
    // change multiple times before the redux store has updated (our nion actions are async)
    const fetchesByDataKey = {}

    class WithNion extends Component {
        static displayName = `WithNion(${getDisplayName(WrappedComponent)})`

        componentWillReceiveProps(nextProps) {
            const { nion } = nextProps // eslint-disable-line no-shadow

            // We want to trigger a fetch when the props change and lead to the creation of a new
            // dataKey, regardless of whether or not that happens as a result of a mount.
            map(nion._declarations, (declaration, key) => { // eslint-disable-line no-shadow
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


        componentDidMount() {
            const { nion } = this.props // eslint-disable-line no-shadow

            // Iterate over the declarations provided to the component, deciding how to manage the
            // load state of each one
            map(nion._declarations, (declaration, key) => { // eslint-disable-line no-shadow
                // If we're supplying a ref to be managed by nion, we'll want to attach it to the
                // state tree ahead of time (maybe not? maybe we want to have a "virtual" ref...
                // this is interesting)
                if (declaration.initialRef) {
                    // If a ref has already been attached to the dataKey, don't dispatch it again...
                    // this triggers a cascading rerender which will cause an infinite loop
                    if (exists(nion[key])) {
                        return
                    }

                    const { dataKey, initialRef } = declaration
                    return nion._initializeDataKey(dataKey, initialRef)
                }
            })
        }

        render() {
            // Filter out internally used props to not expose them in the wrapped component
            const nextProps = {
                ...this.props,
                nion: filterInternalProps(this.props.nion)
            }

            return <WrappedComponent { ...nextProps } />
        }
    }

    const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(WithNion)
    // Take all static properties on the inner Wrapped component and put them on our now-connected component.
    // This makes nion transparent and safe to add as a decorator; it does not occlude the shape of the inner component.
    difference(Object.keys(WrappedComponent), Object.keys(connectedComponent)).map((key) => {
        connectedComponent[key] = WrappedComponent[key]
    })
    return connectedComponent;
}

export default nion

// ----------------------------- Helper functions

// Test for the existence of a nion[key] object. If we don't yet have any data attached to a
// dataKey, nion will still pass down an empty object with "request" and "actions" props in order to
// manage loading the corresponding data. This method tests to see if that object has data
// associated with it.
export function exists(input = {}) {
    if (input._exists === false) {
        return false
    }

    const testExists = (obj) => !!(obj.id && obj.type)

    if (input instanceof Array) {
        return input.filter(testExists).length
    } else {
        return testExists(input)
    }
}

function makeNonExistingObject() {
    const obj = {}
    Object.defineProperty(obj, '_exists', { value: false, enumerable: false })
    return obj
}

function makeExistingObject(input) {
    const output = input instanceof Array ? [ ...input ] : { ...input }
    Object.defineProperty(output, '_exists', { value: true, enumerable: false })
    return output
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
// which are only used internally in the wrapper component
function filterInternalProps (dataProp) {
    const output = {}
    map(dataProp, (obj, key) => {
        if (key === '_declarations' || key === '_initializeDataKey') {
            return
        }
        output[key] = obj
    })
    return output
}

// Yes, a bit funny - but it turns out this is a safe, fast, and terse way of deep cloning data
function clone(input) {
    return JSON.parse(JSON.stringify(input))
}
