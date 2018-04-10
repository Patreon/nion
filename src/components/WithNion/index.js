import map from 'lodash.map'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import exists from '../../utilities/exists'
import {
    getDisplayName,
    isNotLoaded,
    isNotLoading,
} from '../../decorator/utilities'

function withNion(WrappedComponent) {
    // Track the status of fetch actions to avoid sending out duplicate requests, since props can
    // change multiple times before the redux store has updated (our nion actions are async)
    const fetchesByDataKey = {}

    return class WithNion extends Component {
        static displayName = `WithNion(${getDisplayName(WrappedComponent)})`
        static propTypes = { nion: PropTypes.object.isRequired }

        constructor(props) {
            super(props)
            this.initializeDataKeys(props)
        }

        componentWillReceiveProps(nextProps) {
            this.initializeDataKeys(nextProps)
        }

        fetchDataAndUpdatePending(action, dataKey) {
            fetchesByDataKey[dataKey] = action().then(() => {
                fetchesByDataKey[dataKey] = null
            })
        }

        initializeDataKeys(props) {
            const { nion } = props // eslint-disable-line no-shadow

            // We want to trigger a fetch when the props change and lead to the creation of a new
            // dataKey, regardless of whether or not that happens as a result of a mount.

            map(nion._declarations, (declaration, key) => {
                // eslint-disable-line no-shadow
                // If not fetching on init, don't do anything
                if (!declaration.fetchOnInit) {
                    return
                }

                const get = nion[key].actions.get
                const status = nion[key].request.status
                const dataKey = declaration.dataKey

                // We need to manually check the status of the pending fetch action promise, since
                // parent components may send props multiple times to the wrapped component (ie
                // during setState). Because our redux actions are async, the redux store will not
                // be updated before the next componentWillReceiveProps, so looking at the redux
                // request status will be misleading because it will not have been updated
                const isFetchPending = !!fetchesByDataKey[dataKey]

                if (!!isFetchPending) {
                    return
                }

                // If the fetch is only to be performed once, don't fetch if already loaded
                if (declaration.fetchOnce && isNotLoaded(status)) {
                    this.fetchDataAndUpdatePending(get, dataKey)
                } else if (isNotLoading(status)) {
                    this.fetchDataAndUpdatePending(get, dataKey)
                }
            })
        }

        componentDidMount() {
            const { nion } = this.props // eslint-disable-line no-shadow

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

        render() {
            // Filter out internally used props to not expose them in the wrapped component
            const props = {
                ...this.props,
                nion: finalProcessProps(this.props.nion),
            }

            return <WrappedComponent {...props} />
        }
    }
}

export default withNion

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
