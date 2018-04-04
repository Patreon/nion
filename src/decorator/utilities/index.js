import get from 'lodash.get'
import omit from 'lodash.omit'

import { ActionStatus, HTTP_PROTOCOL, HTTPS_PROTOCOL } from '../../constants'

export function makeNonExistingObject() {
    const obj = {}
    Object.defineProperty(obj, '_exists', { value: false, enumerable: false })
    return obj
}

export function makeExistingObject(existingObj = {}) {
    const obj = { ...existingObj }
    Object.defineProperty(obj, '_exists', {
        value: true,
        enumerable: false,
    })
    return obj
}

export function defineNonEnumerable(obj, key, value) {
    Object.defineProperty(obj, key, {
        value,
        enumerable: false,
    })
}

export function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

export function isNotLoading(status) {
    return status !== ActionStatus.PENDING
}

export function isNotLoaded(status) {
    return status === ActionStatus.NOT_CALLED
}

// Helper method to construct a url endpoint from supplied declaration and params.
// This will be used to build the endpoints for the various method actions
export function getUrl(declaration, params, buildUrl) {
    let endpoint = get(declaration, 'endpoint')
    // If supplied endpoint override at call time, then use the supplied endpoint
    if (get(params, 'endpoint')) {
        endpoint = params.endpoint
        params = omit(params, ['endpoint'])
    }

    // Use if a fully-formed url, otherwise pass to buildUrl
    return typeof buildUrl === 'undefined' ||
        typeof endpoint === 'undefined' ||
        endpoint.indexOf(HTTPS_PROTOCOL) === 0 ||
        endpoint.indexOf(HTTP_PROTOCOL) === 0
        ? endpoint
        : buildUrl(endpoint, params)
}
