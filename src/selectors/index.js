import Immutable from 'seamless-immutable'

import { createSelector } from 'reselect'

import get from 'lodash/get'
import omit from 'lodash/omit'

import { denormalizeEntities, getGenericRefData } from '../denormalize'

const selectNion = state => state && state.nion

const selectEntities = createSelector(
    [selectNion],
    nion => nion && nion.entities,
)

const selectReferences = createSelector(
    [selectNion],
    nion => nion && nion.references,
)

const selectRequests = createSelector(
    [selectNion],
    nion => nion && nion.requests,
)

const denormalizeRef = (entities, ref) => {
    // If the ref is a generic (eg a primitive from a non-json-api response), return the ref

    // JB (in ref to the comment above)
    // We know the API type, we should be storing this information with the payload
    // this will simplify our assumptions
    if (!ref || ref.entities === undefined) return getGenericRefData(ref)

    const denormalized = denormalizeEntities(ref, entities)

    return ref.isCollection ? denormalized : denormalized[0]
}

// We need to make a simple singleton default immutable request so that areRequestsEqual comparisons
// are super simple and straightforward in the areMergedPropsEqual comparison function
// TODO: We might want to refactor this so that each request dataKey in the requests reducer is
// initialized with this immutable state
const defaultRequest = Immutable({
    status: 'not called',
})

// Store dataKey-specific selectors created on demand
const selectByKey = { data: {}, dataObj: {}, object: {}, request: {} }

export const selectRequest = key => {
    if (!selectByKey.request[key]) {
        selectByKey.request[key] = createSelector(
            selectRequests,
            requests => get(requests, key, defaultRequest),
        )
    }

    return selectByKey.request[key]
}

// Selects the denormalized object plus all relevant request data from the store
export const selectObjectWithRequest = key => {
    if (!selectByKey.object[key]) {
        selectByKey.object[key] = createSelector(
            [selectReferences, selectEntities, selectRequests],
            (references, entities, requests) => {
                const ref = get(references, key)

                return {
                    obj: denormalizeRef(entities, ref),
                    request: get(requests, key, defaultRequest),
                    extra: omit(ref, ['entities', 'isCollection']),
                }
            },
        )
    }

    return selectByKey.object[key]
}

// Selects a keyed map of { obj, request } resources from the store taking an array of dataKeys
export const selectResourcesForKeys = keys => state =>
    keys.reduce((memo, key) => {
        memo[key] = selectObjectWithRequest(key)(state)
        return memo
    }, {})

// Use the _.get syntax to pass in an address string (ie <dataKey>.<attributeName>), and default
// value. If the provided argument is an object with the signature { type, id }, then select and
// denormalize the corresponding entity
export const selectData = (key, defaultValue) => {
    // If we pass in an object of { type, id } signature, denormalize the corresponding entity
    if (typeof key !== 'string' && !Array.isArray(key)) {
        const selectorKey = `${key.type}[${key.id}]`

        if (!selectByKey.dataObj[selectorKey]) {
            selectByKey.dataObj[selectorKey] = createSelector(
                [selectEntities],
                entityStore =>
                    denormalizeEntities(
                        {
                            entities: [{ type: key.type, id: key.id }],
                        },
                        entityStore,
                    )[0] || defaultValue,
            )
        }

        return selectByKey.dataObj[selectorKey]
    }

    // Otherwise, use the _.get syntax to select the data
    const selectorKey = Array.isArray(key) ? key.join('.') : key

    if (!selectByKey.data[selectorKey]) {
        selectByKey.data[selectorKey] = createSelector(
            [selectEntities, selectReferences],
            (entities, references) => {
                const path = Array.isArray(key)
                    ? key
                    : key.replace(']', '').split(/[.|[]/g)

                const ref = references && references[path[0]]

                const obj = denormalizeRef(entities, ref)

                if (obj === undefined) return defaultValue

                return path.length === 1
                    ? obj
                    : get(obj, path.slice(1, path.length), defaultValue)
            },
        )
    }

    return selectByKey.data[selectorKey]
}
