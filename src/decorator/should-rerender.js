import difference from 'lodash.difference'
import every from 'lodash.every'
import get from 'lodash.get'
import omit from 'lodash.omit'
import deepEqual from 'deep-equal'
import shallowEqual from '../utilities/shallow-equal'
import { exists } from './index'

// We don't want to do a strict immutable check here because we're adding a 'canLoadMore' property
// to the selected request in the nion decorator...
// TODO: we'll probably want to handle that special pagination property a bit more elegantly /
// consistently so that it's automatically added to the request reducer

function compareRequests(prevRequests, nextRequests) {
    return (
        get(prevRequests, 'status') === get(nextRequests, 'status') &&
        get(prevRequests, 'fetchedAt') === get(nextRequests, 'fetchedAt')
    )
}

function compareObject(prevObject, nextObject) {
    // If the selected data do not exist yet, the ad-hoc created nonexistence objects should be
    // treated as equal
    if (!exists(prevObject) && !exists(nextObject)) {
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
function compareData(prevData, nextData) {
    // Cast all input data to an array to make comparisons between non-existent and existent
    // collections more straightforward
    prevData = prevData instanceof Array ? prevData : [prevData]
    nextData = nextData instanceof Array ? nextData : [nextData]

    if (prevData.length !== nextData.length) {
        return false
    }

    for (let i = 0; i < prevData.length; i++) {
        const areEqual = compareObject(prevData[i], nextData[i])
        if (!areEqual) {
            return false
        }
    }
    return true
}

function comparePassedProps(nextProps, props) {
    return shallowEqual(omit(nextProps, 'nion'), omit(props, 'nion'))
}

export function areMergedPropsEqual(nextProps, props) {
    const keysToIgnore = ['_initializeDataKey', 'updateEntity', '_declarations']
    const prevNionKeys = difference(Object.keys(props.nion), keysToIgnore)
    const nextNionKeys = difference(Object.keys(nextProps.nion), keysToIgnore)
    if (prevNionKeys.length !== nextNionKeys.length) {
        return false
    }
    if (!deepEqual(prevNionKeys, nextNionKeys)) {
        return false
    }

    // Check the custom props being passed in from parent components
    const passedPropsAreEqual = comparePassedProps(nextProps, props)
    if (!passedPropsAreEqual) {
        return false
    }

    return every(nextNionKeys, propKey => {
        // Compare this particular nion dataProp's actions, denormalized objects, and request state
        const prevResource = props.nion[propKey]
        const nextResource = nextProps.nion[propKey]

        // TODO: Compare resource.extra, write tests for this comparison
        // TODO: Compare resource.extensions[extensionName].meta for all extensionNames, write tests for this comparison

        // Compare request state
        const requestsAreEqual = compareRequests(
            prevResource.request,
            nextResource.request,
        )
        if (!requestsAreEqual) {
            return false
        }

        // Compare selected denormalized data
        const dataAreEqual = compareData(prevResource.data, nextResource.data)
        return dataAreEqual
    })
}
