import difference from 'lodash.difference'
import every from 'lodash.every'
import get from 'lodash.get'
import omit from 'lodash.omit'
import deepEqual from 'deep-equal'
import shallowEqual from '../utilities/shallow-equal'

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

    console.log(prevExtra, nextExtra)

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

export function objectsAreEqual(prevObject, nextObject) {
    const objectExists = obj => {
        if (obj === null || obj === undefined) {
            return false
        }

        if (obj._exists !== undefined && obj._exists) {
            return obj._exists
        }

        if (obj instanceof Array) {
            return true
        }

        return !!(obj.id && obj.type)
    }

    // If the selected data do not exist yet, the ad-hoc created nonexistence objects should be
    // treated as equal
    if (!objectExists(prevObject) && !objectExists(nextObject)) {
        return true
    } else {
        return prevObject === nextObject
    }
}

// TODO: We can probably make this situation a bit more elegant - right now, we're forced to compare
// each element of an array containing denormalized objects to see if any of them have changed...
// it's probably more straightforward to compare immutable arrays. In addition, this would make
// it easier to handle the subtle weirdness around non-existent objects, which we'll probably want
// to change up how we handle as we transition towards injecting data under the "data" named prop
export function dataAreEqual(prevData, nextData) {
    // Cast all input data to an array to make comparisons between non-existent and existent
    // collections more straightforward
    prevData = prevData instanceof Array ? prevData : [prevData]
    nextData = nextData instanceof Array ? nextData : [nextData]

    if (prevData.length !== nextData.length) {
        return false
    }

    for (let i = 0; i < prevData.length; i++) {
        if (!objectsAreEqual(prevData[i], nextData[i])) {
            return false
        }
    }

    return true
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
