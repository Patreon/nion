import { createSelector, createStructuredSelector } from 'reselect'
import get from 'lodash.get'
import map from 'lodash.map'
import omit from 'lodash.omit'

const getNion = (state) => state.nion
const getEntityStore = (state) => get(getNion(state), 'entities')
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

export const getRequest = (dataKey) => createSelector(
    getRequests,
    (dataRequests) => {
        return get(dataRequests, dataKey)
    }
)

export const getRef = (dataKey) => createSelector(
    getReferences,
    (refs) => {
        return get(refs, dataKey)
    }
)

const getRefEntityTypeCount = (ref, type) => {
    return ref.entities.reduce((count, entity) => entity.type === type ? count += 1 : count = 1, 0)
}

const isCircularReference = (ref, refMap) => {
    // // Specially handle the case of rewards, where the id is shared between many different campaign
    // // rewards and thus might collide
    // if (ref.id === '-1' || ref.id === '0') {
    //     return false
    // }
    if (ref === null) {
        return false
    }
    if (refMap[`${ref.type}-${ref.id}`]) {
        return true
    } else {
        refMap[`${ref.type}-${ref.id}`] = true
    }
    return false
}

const denormalizeHierarchy = (entityStore, ref, hierarchy, refMap) => {
    if (!(ref && ref.type && ref.id)) {
        return undefined
    }
    const entity = get(entityStore, [ref.type, ref.id])
    if (isCircularReference(ref, refMap) || !entity) {
        return ref
    }

    hierarchy = {
        'id': ref.id,
        'type': ref.type,
        ...entity.attributes
    }
    const relationships = get(entity, 'relationships') || {}

    map(relationships, (relationship, relationshipRef) => {
        const relRef = relationship.data

        if (relRef === null) {
            hierarchy[relationshipRef] = null
        } else if (!Array.isArray(relRef)) {
            hierarchy[relationshipRef] = denormalizeHierarchy(entityStore, relRef, hierarchy[relationshipRef], refMap)
        } else {
            hierarchy[relationshipRef] = relRef.map((r) => {
                return denormalizeHierarchy(entityStore, r, hierarchy[relationshipRef], refMap)
            })
        }
    })
    return hierarchy
}

export const selectRef = (key) => createSelector(
    getReferences,
    getEntityStore,
    (refs, entityStore) => {
        const ref = get(refs, key) || defaultRef
        const { isCollection } = ref

        const refEntities = ref.entities.reduce((memo, entityRef) => {
            const refCount = getRefEntityTypeCount(ref, entityRef.type)
            const denormalized = denormalizeHierarchy(entityStore, entityRef, {}, {})

            const isPlural = refCount > 1 || isCollection

            const e = {
                ...denormalized
            }

            if (!memo) {
                memo = isPlural ? [] : {}
            }

            if (isPlural) {
                memo.push(e)
            } else {
                memo = e
            }
            return memo
        }, null)
        return refEntities
    }
)

export const selectLinks = (key) => createSelector(
    getReferences,
    (refs) => get(refs, [key, 'links'])
)

export const selectRequest = (key) => createSelector(
    getRequests,
    selectLinks(key),
    (apiRequests, links) => {
        const request = get(apiRequests, key, defaultRequest)
        const canLoadMore = get(links, 'next') && !request.isLoading
        return { ...request, canLoadMore }
    }
)

export const selectMeta = (key) => createSelector(
    getReferences,
    (refs) => get(refs, [key, 'meta'])
)

export const selectRefWithAllData = (key) => createStructuredSelector({
    ref: selectRef(key),
    request: selectRequest(key),
    links: selectLinks(key),
    meta: selectMeta(key)
})

export const selectRefWithRequest = (key) => createSelector(
    selectRefWithAllData(key),
    (data) => omit(data, val => val === undefined)
)

export const getEntityForRef = (ref) => createSelector(
    getEntityStore,
    (entityStore) => denormalizeHierarchy(entityStore, ref, {}, {})
)

export const selectDataForKeys = (dataKeys) => {
    return (state) => {
        return dataKeys.reduce((memo, key) => {
            memo[key] = selectRefWithRequest(key)(state)
            return memo
        }, {})
    }
}

export const selectDataForKey = (dataKey) => createSelector(
    selectDataForKeys([dataKey]),
    (data) => data[dataKey]
)

export const selectData = (keyOrKeys) => {
    if (keyOrKeys instanceof Array) {
        return selectDataForKeys(keyOrKeys)
    } else {
        return selectDataForKey(keyOrKeys)
    }
}
