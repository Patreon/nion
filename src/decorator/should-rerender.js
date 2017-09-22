import difference from 'lodash.difference'
import every from 'lodash.every'
import get from 'lodash.get'
import omit from 'lodash.omit'
import shallowEqual from 'is-equal-shallow'
import deepEqual from 'deep-equal'
import { hasEntityReference } from '../denormalize'

function areNonNionDataEqual(props, nextProps) {
    const prevNonNionData = omit(props, ['nion'])
    const nextNonNionData = omit(nextProps, ['nion'])
    return shallowEqual(prevNonNionData, nextNonNionData)
}

function getDataPropertyKeys(obj) {
    const enumerableKeys = Object.keys(obj)
    const allKeys = Object.getOwnPropertyNames(obj)
    return difference(allKeys, enumerableKeys)
}

const keysWithCustomComparators = ['actions', 'request', 'allObjects']
function areCustomDataEqual(prevResource, nextResource) {
    const prevDataKeys = getDataPropertyKeys(prevResource)
    const nextDataKeys = getDataPropertyKeys(nextResource)
    const prevExtraProps = difference(prevDataKeys, keysWithCustomComparators)
    const nextExtraProps = difference(nextDataKeys, keysWithCustomComparators)
    if (prevExtraProps.length !== nextExtraProps.length) {
        return false
    }
    return every(nextExtraProps, extraPropKey => {
        return deepEqual(
            get(prevResource, extraPropKey),
            get(nextResource, extraPropKey),
        )
    })
}

function areRequestsEqual(prevRequests, nextRequests) {
    return (
        get(prevRequests, 'status') === get(nextRequests, 'status') &&
        get(prevRequests, 'fetchedAt') === get(nextRequests, 'fetchedAt')
    )
}

function flattenEntities(entitiesTree) {
    if (!entitiesTree) {
        return []
    }
    const result = []
    const entityTypes = Object.keys(entitiesTree).sort()
    entityTypes.forEach(entityType => {
        const entitiesById = entitiesTree[entityType]
        const ids = Object.keys(entitiesById).sort()
        ids.forEach(entityId => {
            result.push(entitiesById[entityId])
        })
    })
    return result
}

function areEntitiesEqual(prevEntity, nextEntity) {
    const prevEntityKeys = Object.keys(prevEntity).sort()
    const nextEntityKeys = Object.keys(nextEntity).sort()
    if (prevEntityKeys.length !== nextEntityKeys.length) {
        return false
    }

    return every(nextEntityKeys, entityKey => {
        const prevValue = prevEntity[entityKey]
        const nextValue = nextEntity[entityKey]
        if (hasEntityReference(nextValue)) {
            return true
        }
        return deepEqual(prevValue, nextValue)
    })
}

function areEntityListsEqual(prevFlatEntities, nextFlatEntities) {
    if (prevFlatEntities.length !== nextFlatEntities.length) {
        return false
    }

    for (let index = 0; index < nextFlatEntities.length; index++) {
        const prevEntity = prevFlatEntities[index]
        const nextEntity = nextFlatEntities[index]
        if (!areEntitiesEqual(prevEntity, nextEntity)) {
            return false
        }
    }

    return true
}

export function areMergedPropsEqual(nextProps, props) {
    if (!areNonNionDataEqual(props, nextProps)) {
        return false
    }

    const keysToIgnore = ['_initializeDataKey', 'updateEntity', '_declarations']
    const prevNionKeys = difference(Object.keys(props.nion), keysToIgnore)
    const nextNionKeys = difference(Object.keys(nextProps.nion), keysToIgnore)
    if (prevNionKeys.length !== nextNionKeys.length) {
        return false
    }
    if (!deepEqual(prevNionKeys, nextNionKeys)) {
        return false
    }
    return every(nextNionKeys, propKey => {
        // Compare this particular nion's object and request state
        const prevResource = props.nion[propKey]
        const nextResource = nextProps.nion[propKey]

        // Compare all extra properties, except those which have custom comparators
        const customDataEqualityResult = areCustomDataEqual(
            prevResource,
            nextResource,
        )
        if (!customDataEqualityResult) {
            return false
        }

        // Compare request state
        const requestsEqualityResult = areRequestsEqual(
            get(prevResource, 'request'),
            get(nextResource, 'request'),
        )
        if (!requestsEqualityResult) {
            return false
        }

        // Compare entity data
        const prevFlatEntities = flattenEntities(
            get(prevResource, 'allObjects'),
        )
        const nextFlatEntities = flattenEntities(
            get(nextResource, 'allObjects'),
        )
        return areEntityListsEqual(prevFlatEntities, nextFlatEntities)
    })
}
