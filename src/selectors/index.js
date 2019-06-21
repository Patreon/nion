import Immutable from 'seamless-immutable'
import { createSelector } from 'reselect'
import get from 'lodash.get'
import omit from 'lodash.omit'
import denormalizeWithCache, { getGenericRefData } from '../denormalize'

const selectNion = state => state.nion
const selectEntities = state => get(selectNion(state), 'entities')
const selectRequests = state => get(selectNion(state), 'requests')
const selectReferences = state => get(selectNion(state), 'references')

const isGeneric = ref => {
    // This may not be the best way to check if something is a ref to entities or not
    return get(ref, 'entities') === undefined
}

export const selectRef = dataKey =>
    createSelector(
        selectReferences,
        refs => get(refs, dataKey),
    )

export const selectEntity = (type, id) =>
    createSelector(
        selectEntities,
        entities => get(entities, [type, id]),
    )

export const selectEntityFromKey = key =>
    createSelector(
        selectRef(key),
        selectEntities,
        (ref, entityStore) => {
            const { isCollection } = ref
            const entities = ref.entities.map(entity => {
                return get(entityStore, [entity.type, entity.id])
            })
            return isCollection ? entities : entities[0]
        },
    )

export const selectObject = dataKey =>
    createSelector(
        selectRef(dataKey),
        selectEntities,
        (ref, entityStore) => {
            // If the ref is a generic (eg a primitive from a non-json-api response), return the ref

            // JB (in ref to the comment above)
            // We know the API type, we should be storing this information with the payload
            // this will simplify our assumptions
            if (isGeneric(ref)) {
                return getGenericRefData(ref)
            }

            const { isCollection } = ref
            const denormalized = denormalizeWithCache(ref, entityStore)

            return isCollection ? denormalized : denormalized[0]
        },
    )

const selectExtraRefProps = dataKey =>
    createSelector(
        selectRef(dataKey),
        ref => ({
            ...omit(ref, ['entities', 'isCollection']),
        }),
    )

// We need to make a simple singleton default immutable request so that areRequestsEqual comparisons
// are super simple and straightforward in the areMergedPropsEqual comparison function
// TODO: We might want to refactor this so that each request dataKey in the requests reducer is
// initialized with this immutable state
const defaultRequest = Immutable({
    status: 'not called',
})

export const selectRequest = key =>
    createSelector(
        selectRequests,
        apiRequests => {
            const request = get(apiRequests, key, defaultRequest)
            return request
        },
    )

// Selects the denormalized object plus all relevant request data from the store
export const selectObjectWithRequest = dataKey =>
    createSelector(
        selectObject(dataKey),
        selectRequest(dataKey),
        selectExtraRefProps(dataKey),
        (obj, request, extra) => ({
            obj,
            request,
            extra,
        }),
    )

// Selects a keyed map of { obj, request } resources from the store taking an array of dataKeys
export const selectResourcesForKeys = (dataKeys, returnAllObjects = false) => {
    return state => {
        return dataKeys.reduce((memo, key) => {
            memo[key] = selectObjectWithRequest(key, returnAllObjects)(state)
            return memo
        }, {})
    }
}

// Selects the combination { obj, request } resource from the store taking a dataKey
export const selectResourceForKey = dataKey => state =>
    selectObjectWithRequest(dataKey)(state)

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
        const entityRef = {
            entities: [{ type: key.type, id: key.id }],
        }

        return createSelector(
            selectEntities,
            entityStore => denormalizeWithCache(entityRef, entityStore)[0],
        )
    }

    // Otherwise, use the _.get syntax to select the data
    const splitKeys =
        key instanceof Array ? key : key.replace(']', '').split(/[.|[]/g)
    const dataKey = splitKeys[0]
    return createSelector(
        selectObject(dataKey),
        obj => {
            if (splitKeys.length === 1) {
                return obj === undefined ? defaultValue : obj
            } else {
                return get(
                    obj,
                    splitKeys.slice(1, splitKeys.length),
                    defaultValue,
                )
            }
        },
    )
}
