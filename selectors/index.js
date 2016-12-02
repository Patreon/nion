import { createSelector, createStructuredSelector } from 'reselect'
import get from 'lodash.get'
import denormalize from './denormalize'

const getNion = (state) => state.nion
const getEntities = (state) => get(getNion(state), 'entities')
const getRequests = (state) => get(getNion(state), 'requests')
const getReferences = (state) => get(getNion(state), 'references')

const defaultRef = {
    entities: [],
    meta: {},
    links: {}
}

const defaultRequest = {
    status: 'not called'
}

export const getRef = (dataKey) => createSelector(
    getReferences,
    (refs) => get(refs, dataKey)
)

export const getEntity = (type, id) => createSelector(
    getEntities,
    (entities) => get(entities, [type, id])
)

export const getEntityFromKey = (key) => createSelector(
    getRef(key),
    getEntities,
    (ref, entityStore) => {
        const { isCollection } = ref
        const entities = ref.entities.map(entity => {
            return get(entityStore, [entity.type, entity.id])
        })
        return isCollection ? entities : entities[0]
    }
)

export const getObject = (key) => createSelector(
    getReferences,
    getEntities,
    (references, entityStore) => {
        const ref = get(references, key) || defaultRef
        const { isCollection } = ref

        const denormalized = ref.entities.map(entityRef => {
            return denormalize(entityRef, entityStore)
        })

        return isCollection ? denormalized : denormalized[0]
    }
)

const getLinks = (key) => createSelector(
    getReferences,
    (references) => get(references, [key, 'links'])
)

const getMeta = (key) => createSelector(
    getReferences,
    (refs) => get(refs, [key, 'meta'])
)

export const getRequest = (key) => createSelector(
    getRequests,
    getLinks(key),
    (apiRequests, links) => {
        const request = get(apiRequests, key, defaultRequest)
        const canLoadMore = get(links, 'next') && !request.isLoading
        return { ...request, canLoadMore }
    }
)

export const getObjectWithRequest = (key) => createStructuredSelector({
    obj: getObject(key),
    request: getRequest(key),
    links: getLinks(key),
    meta: getMeta(key)
})

export const getResourcesForKeys = (dataKeys) => {
    return (state) => {
        return dataKeys.reduce((memo, key) => {
            memo[key] = getObjectWithRequest(key)(state)
            return memo
        }, {})
    }
}

export const getResourceForKey = (dataKey) => createSelector(
    getResourcesForKeys([dataKey]),
    (data) => data[dataKey]
)

export const getResource = (keyOrKeys) => {
    if (keyOrKeys instanceof Array) {
        return getResourcesForKeys(keyOrKeys)
    } else {
        return getResourceForKey(keyOrKeys)
    }
}

// Use the _.get syntax to pass in an address string (ie <dataKey>.<attributeName>), and default
// value
export const getData = (key, defaultValue) => {
    const splitKeys = key instanceof Array ? key : key.split('.')
    const dataKey = splitKeys[0]
    return createSelector(
        getObject(dataKey),
        obj => {
            if (splitKeys.length === 1) {
                return obj === undefined ? defaultValue : obj
            } else {
                return get(obj, splitKeys.slice(1, splitKeys.length), defaultValue)
            }
        }
    )
}
