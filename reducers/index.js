import { combineReducers } from 'redux'
import { createSelector } from 'reselect'
import get from 'lodash.get'

import references from './references'
import requests from './requests'
import entities from './entities'

export default combineReducers({
    references,
    requests,
    entities
})

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
    if (refMap[`${ref.type}-${ref.id}`]) {
        return true
    } else {
        refMap[`${ref.type}-${ref.id}`] = true
    }
    return false
}

const denormalizeHiearchy = (entityStore, ref, hierarchy, refMap) => {
    if (!(ref && ref.type && ref.id)) {
        return undefined
    }
    const entity = get(entityStore, `${ref.type}.${ref.id}`)
    if (isCircularReference(ref, refMap) || !entity) {
        return ref
    }
    hierarchy = {
        'id': ref.id,
        'type': ref.type,
        ...entity.attributes
    }
    const relationships = get(entity, 'relationships') || {}
    Object.keys(relationships).map((relationshipRef) => {
        const relRef = entity.relationships[relationshipRef].data
        if (!Array.isArray(relRef)) {
            hierarchy[relationshipRef] = denormalizeHiearchy(entityStore, relRef, hierarchy[relationshipRef], refMap)
        } else {
            hierarchy[relationshipRef] = [...relRef.map((r) => {
                return denormalizeHiearchy(entityStore, r, hierarchy[relationshipRef], refMap)
            })]
        }
    })
    return hierarchy
}

export const getRefWithEntities = (dataKey) => createSelector(
    getReferences,
    getRequests,
    getEntityStore,
    (refs, apiRequests, entityStore) => {
        const ref = get(refs, dataKey) || defaultRef
        const req = get(apiRequests, dataKey) || defaultRequest
        const refEntities = ref.entities.reduce((memo, entityRef) => {
            const key = entityRef.type
            const refCount = getRefEntityTypeCount(ref, entityRef.type)
            const denormalized = denormalizeHiearchy(entityStore, entityRef, {}, {})
            const e = {
                ...denormalized
            }

            if (!(key in memo)) {
                memo[entityRef.type] = refCount > 1 ? [] : {}
            }
            if (refCount > 1) {
                memo[key].push(e)
            } else {
                memo[key] = e
            }
            return memo
        }, {})
        return {
            request: req,
            ...refEntities
        }
    }
)

export const getEntityForRef = (ref) => (store) => (
    createSelector(
        getEntityStore,
        (entityStore) => (denormalizeHiearchy(entityStore, ref, {}, {}))
    )(store)
)

export const selectData = (dataKeys) => (
    (state) => (
        dataKeys.reduce((memo, ref) => {
            memo[ref] = getRefWithEntities(ref)(state)
            return memo
        }, {})
    )
)

export const selectDataForKey = (myDataKey) => (state) => (
    selectData([myDataKey])(state)[myDataKey]
)
