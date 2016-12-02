import React, { Component } from 'react'
import get from 'lodash.get'
import set from 'lodash.set'
import some from 'lodash.some'
import map from 'lodash.map'

import jsonApiUrl from 'utilities/json-api-url'

import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import { jsonApi } from '../actions'
import { selectResourcesForKeys } from 'libs/nion/selectors'

const defaultOptions = {
    // Component / API Lifecycle methods
    onMount: true, // Should the component load the data when it mounts?
    once: true, // Should the component only load the data once on mount?

    // Special request type parameters
    paginated: false
}

const processDefaultOptions = (directives) => {
    map(directives, (directive, key) => {
        map(defaultOptions, (defaultState, defaultKey) => {
            const option = get(directive, defaultKey, defaultState)
            directive[defaultKey] = option
        })
    })
}

const processDirectives = (directives) => {
    // Apply default options to the directives
    processDefaultOptions(directives)

    // The passed in directives object is a map of dataKeys to fetch and their corresponding params.
    // We need to handle both the component-scoped key (the key of the object passed to the
    // decorator) as well as the dataKey that points to where the ref / request is stored on the
    // state tree
    const mapDirectives = (fn) => (
        map(directives, (directive, key) => (
            fn(directive, key, directive.dataKey || key)
        ))
    )

    // We want to pass in the selected data to the wrapped component by the key (ie pledge), even
    // though we may be storing the data on the store by an id-specific dataKey (ie pledge:1234).
    // We'll need to make a map from dataKey to key to handle passing the props more semantically to
    // the wrapped component. We'll need these dataKeys for creating our selector as well.
    const keysByDataKey = {}
    const dataKeys = mapDirectives((directive, key, dataKey) => {
        keysByDataKey[dataKey] = key
        return dataKey
    })

    // Construct the JSON API selector to map to props
    const mapStateToProps = createSelector(
        selectResourcesForKeys(dataKeys),
        (selectedResources) => {
            const data = {}
            const requests = {}
            const actions = {}
            const links = {}
            const meta = {}

            // Now map back over the dataKeys to their original keys
            map(selectedResources, (selected, selectedDataKey) => {
                const key = keysByDataKey[selectedDataKey]

                // We want the passed in data to be flat attributes
                if (selected.obj instanceof Array) {
                    data[key] = [ ...selected.obj ]
                } else if (selected.obj === null || selected.obj === undefined) {
                    data[key] = null
                } else {
                    data[key] = { ...selected.obj }
                }

                requests[key] = selected.request
                links[key] = selected.links
                meta[key] = selected.meta
                actions[key] = {}
            })

            return { nion: { data, requests, actions, links, meta } }
        }
    )

    // Decide whether or not the wrapped component should handle the request lifecycle automatically
    const shouldHandleLifecycle = some(mapDirectives((directive) => {
        const { onMount } = directive
        return onMount
    }))

    // Construct the dispatch methods to pass action creators to the component
    const mapDispatchToProps = (dispatch) => {
        const dispatchProps = {}

        // Helper method to construct a JSON API url endpoint from supplied directive and params. This will be userd to build the endpoints for the various method actions
        function makeJsonApiEndpoint(directive, params) {
            const endpoint = get(directive, 'endpoint')
            const include = get(directive, 'include', [])
            const fields = get(directive, 'fields', {})

            return jsonApiUrl(
                callOrPass(endpoint, params),
                {
                    include: callOrPass(include, params),
                    fields: callOrPass(fields, params)
                }
            )
        }

        // Map over the supplied directives to build out the 4 main methods to add to the actions
        // subprop, as well as the special case next method for paginated resources
        mapDirectives((directive, key, dataKey) => {
            dispatchProps[key] = {}

            const methodsWithBody = ['PATCH', 'POST']
            methodsWithBody.forEach(method => {
                dispatchProps[key][method] = (data = {}, params) => {
                    const jsonApiEndpoint = makeJsonApiEndpoint(directive, params)

                    dispatch(jsonApi[method.toLowerCase()](dataKey, {
                        endpoint: jsonApiEndpoint,
                        body: { data }
                    }))
                }
            })

            const methodsWithoutBody = ['GET', 'DELETE']
            methodsWithoutBody.forEach(method => {
                dispatchProps[key][method] = (data = {}, params) => {
                    const jsonApiEndpoint = makeJsonApiEndpoint(directive, params)

                    dispatch(jsonApi[method.toLowerCase()](dataKey, {
                        endpoint: jsonApiEndpoint
                    }))
                }
            })

            if (directive.paginated) {
                dispatchProps[key]['NEXT'] = ({ next }) => {
                    dispatch(jsonApi.get(dataKey, {
                        endpoint: next,
                        meta: {
                            isNextPage: true
                        }
                    }))
                }
            }
        })

        return dispatchProps
    }

    // The endpoint / include / fields params can be either a basic parameter (string /
    // arrray / object) or a method that returns the corresponding type based on the
    // component's props. We use callOrPass to either pass the value back or call the
    // method
    function callOrPass(param, props) {
        return param instanceof Function ? param(props) : param
    }

    // Now, transform the dispatch props (<ref>Request) into a 'call' method on the
    // data[ref][request] prop
    const mergeProps = (stateProps, dispatchProps, ownProps) => {
        const nextProps = { ...stateProps, ...ownProps }
        mapDirectives((directive, key, dataKey) => {
            // Add each method's corresponding request handler to the nextProps[key].request
            // object
            const methods = ['GET', 'PATCH', 'POST', 'DELETE']
            methods.forEach(method => {
                if (dispatchProps[key][method]) {
                    const dispatchFn = dispatchProps[key][method]
                    set(nextProps.nion, ['actions', key, method.toLowerCase()], dispatchFn)
                }
            })

            // Handle the special NEXT submethod, for paginated directives
            if (dispatchProps[key]['NEXT']) {
                const { nion } = stateProps
                const next = get(nion, ['links', key, 'next'])

                const dispatchFn = dispatchProps[key]['NEXT']
                if (next) {
                    const nextFn = () => dispatchFn({ next })
                    set(nextProps.nion, ['actions', key, 'next'], nextFn)
                }
            }
        })
        return nextProps
    }

    return { mapStateToProps, mapDispatchToProps, mergeProps, shouldHandleLifecycle }
}

const connectComponent = (directives, WrappedComponent) => { // eslint-disable-line no-shadow
    const {
        mapStateToProps,
        mapDispatchToProps,
        mergeProps,
        shouldHandleLifecycle
    } = processDirectives(directives)

    class WithJsonApi extends Component {
        static displayName = `WithJsonApi(${getDisplayName(WrappedComponent)})`

        componentDidMount() {
            const { nion } = this.props // eslint-disable-line no-shadow

            if (!shouldHandleLifecycle) {
                return
            }

            // Iterate over the directives provided to the component, deciding how to manage the
            // load state of each one
            map(directives, (directive, key) => { // eslint-disable-line no-shadow
                const fetch = nion.actions[key].get

                // If not loading on mount, don't do anything
                if (!directive.onMount) {
                    return
                }

                // If the load is only to be performed once, don't fetch if the data has been loaded
                if (directive.once) {
                    const status = nion.requests[key].status
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
const nion = (directives, options) => (WrappedComponent) => {

    // If a static object of directives is passed in, process it immediately, otherwise, pass the incoming props to the directives function to generate a directives object
    if (directives instanceof Function) {
        return props => {
            const ConnectedComponent = connectComponent(directives(props), WrappedComponent)
            return <ConnectedComponent { ...props } />
        }
    } else if (directives instanceof Object) {
        return connectComponent(directives, WrappedComponent)
    }
}

export default nion

// Helper functions
function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

function isNotLoaded(status) {
    return status === 'not called'
}
