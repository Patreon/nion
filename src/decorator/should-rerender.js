import difference from 'lodash.difference'
import every from 'lodash.every'
import get from 'lodash.get'
import omit from 'lodash.omit'
import deepEqual from 'deep-equal'
import shallowEqual from '../utilities/shallow-equal'
import { exists } from './index'

export function requestsAreEqual(prevRequests, nextRequests) {
    return (
        get(prevRequests, 'status') === get(nextRequests, 'status') &&
        get(prevRequests, 'fetchedAt') === get(nextRequests, 'fetchedAt')
    )
}

export function extrasAreEqual(prevExtra, nextExtra) {
    if (!(prevExtra && nextExtra)) {
        return true
    }

    const prevExtraKeys = Object.keys(prevExtra) || []
    const nextExtraKeys = Object.keys(nextExtra) || []

    if (prevExtraKeys.length !== nextExtraKeys.length) {
        return false
    }

    return shallowEqual(prevExtra, nextExtra)
}

export function extensionsAreEqual(prevExts, nextExts) {
    if (!(prevExts && nextExts)) {
        return true
    }

    const prevExtensionKeys = Object.keys(prevExts) || []
    const nextExtensionKeys = Object.keys(nextExts) || []

    if (!deepEqual(prevExtensionKeys, nextExtensionKeys)) {
        return false
    }

    return every(nextExtensionKeys, key => {
        return deepEqual(
            get(prevExts, [key, 'meta']),
            get(nextExts, [key, 'meta']),
        )
    })
}

export function dataAreEqual(prevData, nextData) {
    const safeKeys = object =>
        // typeof null => 'object', hence both these checks
        typeof object === 'object' && object !== null ? Object.keys(object) : []

    const prevKeys = safeKeys(prevData)
    const nextKeys = safeKeys(nextData)

    if (prevKeys.length !== nextKeys.length) {
        return false
    }

    return every(prevKeys, key => {
        if (!exists(prevData[key]) && !exists(nextData[key])) {
            return true
        }

        return prevData[key] === nextData[key]
    })
}

export function passedPropsAreEqual(nextProps, props) {
    return shallowEqual(omit(nextProps, 'nion'), omit(props, 'nion'))
}

export function areMergedPropsEqual(nextProps, props) {
    const keysToIgnore = ['_initializeDataKey', 'updateEntity', '_declarations']
    const prevNionKeys = difference(Object.keys(props.nion), keysToIgnore)
    const nextNionKeys = difference(Object.keys(nextProps.nion), keysToIgnore)
    if (prevNionKeys.length !== nextNionKeys.length) {
        return false
    }
    if (!shallowEqual(prevNionKeys, nextNionKeys)) {
        return false
    }

    // Check the custom props being passed in from parent components
    if (!passedPropsAreEqual(nextProps, props)) {
        return false
    }

    return every(nextNionKeys, propKey => {
        // Compare this particular nion dataProp's actions, denormalized objects, and request state
        const prevResource = props.nion[propKey]
        const nextResource = nextProps.nion[propKey]

        // Compare request state
        if (!requestsAreEqual(prevResource.request, nextResource.request)) {
            return false
        }

        if (!extrasAreEqual(prevResource.extra, nextResource.extra)) {
            return false
        }

        // Compare extensions
        if (
            !extensionsAreEqual(
                prevResource.extensions,
                nextResource.extensions,
            )
        ) {
            return false
        }

        // Compare selected denormalized data
        return dataAreEqual(prevResource.data, nextResource.data)
    })
}
