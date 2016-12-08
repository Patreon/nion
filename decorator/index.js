import React, { Component } from 'react'
import get from 'lodash.get'
import set from 'lodash.set'
import map from 'lodash.map'
import merge from 'lodash.merge'
import promiseActions from '../actions/promises'
import { buildUrl, deconstructUrl } from 'libs/nion/url'

import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import { INITIALIZE_DATAKEY, UPDATE_ENTITY } from '../actions/types'
import { selectResourcesForKeys } from 'libs/nion/selectors'

const defaultDeclarativeOptions = {
    // Component / API Lifecycle methods
    onMount: false, // Should the component load the data when it mounts?
    once: true, // Should the component only load the data once on mount?

    // Manual ref initialization, for parent/child data management relationships
    initialRef: null,

    // Special request type parameters
    paginated: false
}

function processDefaultOptions(declaratives) {
    map(declaratives, (declarative, key) => {
        map(defaultDeclarativeOptions, (defaultState, defaultKey) => {
            const option = get(declarative, defaultKey, defaultState)
            declarative[defaultKey] = option
        })
    })
}

function processDeclaratives(declaratives) {
    // Apply default options to the declaratives
    processDefaultOptions(declaratives)

    // The passed in declaratives object is a map of dataKeys to fetch and their corresponding
    // params. We need to handle both the component-scoped key (the key of the object passed to the
    // decorator) as well as the dataKey that points to where the ref / request is stored on the
    // state tree
    const mapDeclaratives = (fn) => (
        map(declaratives, (declarative, key) => (
            fn(declarative, key, declarative.dataKey || key)
        ))
    )

    // We want to pass in the selected data to the wrapped component by the key (ie pledge), even
    // though we may be storing the data on the store by an id-specific dataKey (ie pledge:1234).
    // We'll need to make a map from dataKey to key to handle passing the props more semantically to
    // the wrapped component. We'll need these dataKeys for creating our selector as well.
    const keysByDataKey = {}
    const dataKeys = mapDeclaratives((declarative, key, dataKey) => {
        keysByDataKey[dataKey] = key

        // Ensure the dataKey is set properly on the declarative
        declarative.dataKey = declarative.dataKey || key

        return dataKey
    })

    function defineDataProperty(obj, key, value){
        Object.defineProperty(obj, key, {
            value,
            enumerable: false
        })
    }

    // Construct the JSON API selector to map to props
    const mapStateToProps = createSelector(
        selectResourcesForKeys(dataKeys),
        (selectedResources) => {
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

                // Define the nion-specific properties as non-enumerable properties on the dataKey
                // prop
                defineDataProperty(nion[key], 'request', { ...selected.request })
                defineDataProperty(nion[key], 'links', { ...selected.links })
                defineDataProperty(nion[key], 'actions', {})
            })

            return { nion }
        }
    )

    // Construct the dispatch methods to pass action creators to the component
    const mapDispatchToProps = (dispatch) => {
        const dispatchProps = {}

        // Helper method to construct a JSON API url endpoint from supplied declarative and params.
        // This will be used to build the endpoints for the various method actions
        function getJsonApiUrl(declarative, params) {
            const endpoint = get(declarative, 'endpoint')
            // Use if a fully-formed url, otherwise pass to buildUrl
            return endpoint.indexOf('https://') === 0 ? endpoint : buildUrl(endpoint, params)
        }

        // Map over the supplied declaratives to build out the 4 main methods to add to the actions
        // subprop, as well as the special case next method for paginated resources
        mapDeclaratives((declarative, key, dataKey) => {
            dispatchProps[key] = {}

            dispatchProps[key]['POST'] = (data = {}, params) => {
                const endpoint = getJsonApiUrl(declarative, params)
                return promiseActions.post(dataKey, {
                    endpoint,
                    body: { data }
                })(dispatch)
            }

            dispatchProps[key]['PATCH'] = (data = {}, params) => {
                const endpoint = getJsonApiUrl(declarative, params)
                return promiseActions.patch(dataKey, {
                    endpoint,
                    body: { data }
                })(dispatch)
            }

            dispatchProps[key]['GET'] = (params) => {
                const endpoint = getJsonApiUrl(declarative, params)
                return promiseActions.get(dataKey, { endpoint })(dispatch)
            }

            dispatchProps[key]['DELETE'] = (ref = {}, params) => {
                const endpoint = getJsonApiUrl(declarative, params)
                return promiseActions.delete(dataKey, ref, { endpoint })(dispatch)
            }

            if (declarative.paginated) {
                dispatchProps[key]['NEXT'] = ({ next }, params) => {
                    const nextUrl = next.indexOf('http') === 0 ? next : `https://${next}`
                    const { pathname, options: nextUrlOptions } = deconstructUrl(nextUrl)

                    // Since the nextUrl doesn't necessarily return the correct includes / fields,
                    // we'll need to manually override those fields if supplied
                    const suppliedUrl = getJsonApiUrl(declarative, params)
                    const { options: suppliedUrlOptions } = deconstructUrl(suppliedUrl)

                    const newOptions = merge(nextUrlOptions, suppliedUrlOptions)

                    const newEndpoint = buildUrl(pathname, {
                        ...newOptions
                    })

                    return promiseActions.next(dataKey, { endpoint: newEndpoint })(dispatch)
                }
            }

            if (declarative.initialRef) {
                // Private, internal nion data manipulating actions
                dispatchProps[key].initializeDataKey = (ref) => {
                    dispatch({
                        type: INITIALIZE_DATAKEY,
                        payload: { dataKey, ref }
                    })
                }
            }
        })

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

        mapDeclaratives((declarative, key, dataKey) => {
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

            // Handle the special NEXT submethod, for paginated declaratives
            if (dispatchProps[key]['NEXT']) {
                const { nion } = stateProps
                const next = get(nion, [key, 'links', 'next'])

                const dispatchFn = dispatchProps[key]['NEXT']
                if (next) {
                    const nextFn = () => dispatchFn({ next })
                    set(nextProps.nion, [key, 'actions', 'next'], nextFn)
                }
            }

            if (dispatchProps[key].initializeDataKey) {
                const fn = dispatchProps[key].initializeDataKey
                set(nextProps.nion, [key, 'actions', '_initializeDataKey'], fn)
            }
        })

        // Pass along the global nion action creators
        nextProps.nion.updateEntity = dispatchProps.updateEntity

        return nextProps
    }

    return {
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
    }
}

function connectComponent(declaratives, options, WrappedComponent) { // eslint-disable-line no-shadow
    const {
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
    } = processDeclaratives(declaratives, options)

    class WithJsonApi extends Component {
        static displayName = `WithJsonApi(${getDisplayName(WrappedComponent)})`

        componentDidMount() {
            const { nion } = this.props // eslint-disable-line no-shadow

            // Iterate over the declaratives provided to the component, deciding how to manage the
            // load state of each one
            map(declaratives, (declarative, key) => { // eslint-disable-line no-shadow
                const fetch = nion[key].actions.get

                // If we're supplying a ref to be managed by nion, we'll want to attach it to the
                // state tree ahead of time (maybe not? maybe we want to have a "virtual" ref...
                // this is interesting)
                if (declarative.initialRef) {
                    // If a ref has already been attached to the dataKey, don't dispatch it again...
                    // this triggers a cascading rerender which will cause an infinite loop
                    if (exists(nion[key])) {
                        return
                    }

                    const ref = declarative.initialRef
                    const initializeDataKey = nion[key].actions._initializeDataKey
                    return initializeDataKey(ref)
                }

                // If not loading on mount, don't do anything
                if (!declarative.onMount) {
                    return
                }

                // If the load is only to be performed once, don't fetch if the data has been loaded
                if (declarative.once) {
                    const status = nion[key].request.status
                    if (isNotLoaded(status)) {
                        fetch(this.props)
                    }
                } else {
                    fetch(this.props)
                }
            })
        }
        render() {
            return <WrappedComponent { ...this.props } />
        }
    }

    return connect(mapStateToProps, mapDispatchToProps, mergeProps)(WithJsonApi)
}


// JSON API decorator function for wrapping connected components to the new JSON API redux system
const nion = (declaratives = {}, options = {}) => (WrappedComponent) => {

    // If a static object of declaratives is passed in, process it immediately, otherwise, pass the
    // incoming props to the declaratives function to generate a declaratives object
    if (declaratives instanceof Function) {
        return props => {
            const ConnectedComponent = connectComponent(declaratives(props), options, WrappedComponent)
            return <ConnectedComponent { ...props } />
        }
    } else if (declaratives instanceof Object) {
        return connectComponent(declaratives, options, WrappedComponent)
    }
}

export default nion

// ----------------------------- Helper functions

// Test for the existence of a nion[key] object. If we don't yet have any data attached to a
// dataKey, nion will still pass down an empty object with "request" and "actions" props in order to
// manage loading the corresponding data. This method tests to see if that object has data
// associated with it.
export function exists(input = {}) {
    if (!input._exists) {
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

function isNotLoaded(status) {
    return status === 'not called'
}
