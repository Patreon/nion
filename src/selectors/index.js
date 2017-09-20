import { createSelector } from 'reselect'
import get from 'lodash.get'
import omit from 'lodash.omit'
import denormalize from '../denormalize'
import denormalizeWithCache from '../denormalize/with-cache'

const selectNion = state => state.nion
const selectEntities = state => get(selectNion(state), 'entities')
const selectRequests = state => get(selectNion(state), 'requests')
const selectReferences = state => get(selectNion(state), 'references')

const makeDefaultRequest = () => ({
    status: 'not called',
})

const isGeneric = ref => {
    // This may not be the best way to check if something is a ref to entities or not
    return get(ref, 'entities') === undefined
}

export const selectRef = dataKey =>
    createSelector(selectReferences, refs => get(refs, dataKey))

export const selectEntity = (type, id) =>
    createSelector(selectEntities, entities => get(entities, [type, id]))

export const selectEntityFromKey = key =>
    createSelector(selectRef(key), selectEntities, (ref, entityStore) => {
        const { isCollection } = ref
        const entities = ref.entities.map(entity => {
            return get(entityStore, [entity.type, entity.id])
        })
        return isCollection ? entities : entities[0]
    })

export const selectObject = dataKey =>
    createSelector(selectRef(dataKey), selectEntities, (ref, entityStore) => {
        // If the ref is a generic (eg a primitive from a non-json-api response), return the ref
        if (isGeneric(ref)) {
            return ref
        }

        const { isCollection } = ref
        const denormalized = denormalizeWithCache(ref, entityStore, dataKey)

        return isCollection ? denormalized : denormalized[0]
    })

const selectExtraRefProps = key =>
    createSelector(selectRef(key), ref => ({
        ...omit(ref, ['entities', 'isCollection']),
    }))

export const selectRequest = key =>
    createSelector(selectRequests, apiRequests => {
        const request = get(apiRequests, key, makeDefaultRequest())
        return { ...request }
    })

// Selects the denormalized object plus all relevant request data from the store
export const selectObjectWithRequest = key =>
    createSelector(
        selectObject(key),
        selectRequest(key),
        selectExtraRefProps(key),
        (obj, request, extra) => ({
            obj,
            request,
            ...extra,
        }),
    )

// Selects a keyed map of { obj, request } resources from the store taking an array of dataKeys
export const selectResourcesForKeys = dataKeys => {
    return state => {
        return dataKeys.reduce((memo, key) => {
            memo[key] = selectObjectWithRequest(key)(state)
            return memo
        }, {})
    }
}

// Selects the combination { obj, request } resource from the store taking a dataKey
export const selectResourceForKey = dataKey =>
    createSelector(selectResourcesForKeys([dataKey]), data => data[dataKey])

// Selects the combination { obj, request } resource from the store, taking either a dataKey or
// array of dataKeys
export const selectResource = keyOrKeys => {
    if (keyOrKeys instanceof Array) {
        return selectResourcesForKeys(keyOrKeys)
    } else {
        return selectResourceForKey(keyOrKeys)
    }
}

// Use the _.get syntax to pass in an address string (ie <dataKey>.<attributeName>), and default
// value. If the provided argument is an object with the signature { type, id }, then select and
// denormalize the corresponding entity
export const selectData = (key, defaultValue) => {
    // If we pass in an object of { type, id } signature, denormalize the corresponding entity
    if (typeof key === 'object' && key.type && key.id !== undefined) {
        const entityRef = key
        return createSelector(selectEntities, entityStore =>
            denormalize(entityRef, entityStore),
        )
    }

    // Otherwise, use the _.get syntax to select the data
    const splitKeys =
        key instanceof Array ? key : key.replace(']', '').split(/[.|[]/g)
    const dataKey = splitKeys[0]
    return createSelector(selectObject(dataKey), obj => {
        if (splitKeys.length === 1) {
            return obj === undefined ? defaultValue : obj
        } else {
            return get(obj, splitKeys.slice(1, splitKeys.length), defaultValue)
        }
    })
}
