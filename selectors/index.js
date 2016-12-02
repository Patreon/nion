import { createSelector, createStructuredSelector } from 'reselect'
import get from 'lodash.get'
import denormalize from './denormalize'

const selectNion = (state) => state.nion
const selectEntities = (state) => get(selectNion(state), 'entities')
const selectRequests = (state) => get(selectNion(state), 'requests')
const selectReferences = (state) => get(selectNion(state), 'references')

const defaultRef = {
    entities: [],
    meta: {},
    links: {}
}

const defaultRequest = {
    status: 'not called'
}

export const selectRef = (dataKey) => createSelector(
    selectReferences,
    (refs) => get(refs, dataKey)
)

export const selectEntity = (type, id) => createSelector(
    selectEntities,
    (entities) => get(entities, [type, id])
)

export const selectEntityFromKey = (key) => createSelector(
    selectRef(key),
    selectEntities,
    (ref, entityStore) => {
        const { isCollection } = ref
        const entities = ref.entities.map(entity => {
            return get(entityStore, [entity.type, entity.id])
        })
        return isCollection ? entities : entities[0]
    }
)

export const selectObject = (key) => createSelector(
    selectReferences,
    selectEntities,
    (references, entityStore) => {
        const ref = get(references, key) || defaultRef
        const { isCollection } = ref

        const denormalized = ref.entities.map(entityRef => {
            return denormalize(entityRef, entityStore)
        })

        return isCollection ? denormalized : denormalized[0]
    }
)

const selectLinks = (key) => createSelector(
    selectReferences,
    (references) => get(references, [key, 'links'])
)

const selectMeta = (key) => createSelector(
    selectReferences,
    (refs) => get(refs, [key, 'meta'])
)

export const selectRequest = (key) => createSelector(
    selectRequests,
    selectLinks(key),
    (apiRequests, links) => {
        const request = get(apiRequests, key, defaultRequest)
        const canLoadMore = get(links, 'next') && !request.isLoading
        return { ...request, canLoadMore }
    }
)

export const selectObjectWithRequest = (key) => createStructuredSelector({
    obj: selectObject(key),
    request: selectRequest(key),
    links: selectLinks(key),
    meta: selectMeta(key)
})

export const selectResourcesForKeys = (dataKeys) => {
    return (state) => {
        return dataKeys.reduce((memo, key) => {
            memo[key] = selectObjectWithRequest(key)(state)
            return memo
        }, {})
    }
}

export const selectResourceForKey = (dataKey) => createSelector(
    selectResourcesForKeys([dataKey]),
    (data) => data[dataKey]
)

export const selectResource = (keyOrKeys) => {
    if (keyOrKeys instanceof Array) {
        return selectResourcesForKeys(keyOrKeys)
    } else {
        return selectResourceForKey(keyOrKeys)
    }
}

// Use the _.get syntax to pass in an address string (ie <dataKey>.<attributeName>), and default
// value
export const selectData = (key, defaultValue) => {
    const splitKeys = key instanceof Array ? key : key.split('.')
    const dataKey = splitKeys[0]
    return createSelector(
        selectObject(dataKey),
        obj => {
            if (splitKeys.length === 1) {
                return obj === undefined ? defaultValue : obj
            } else {
                return get(obj, splitKeys.slice(1, splitKeys.length), defaultValue)
            }
        }
    )
}
