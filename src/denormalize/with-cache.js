import Immutable from 'seamless-immutable'

console.log('🍕', Immutable)

import get from 'lodash.get'
import map from 'lodash.map'
import { camelize, camelizeKeys } from 'humps'

const makeKey = (type, id) => `${type}:${id}`

class EntityCache {
    denormalized = {}
    related = {}
    entities = {}

    addDenormalized = (type, id, data) => {
        const key = makeKey(type, id)
        this.denormalized[key] = data
    }

    addEntity = entity => {
        const entityKey = makeKey(entity.type, entity.id)
        this.entities[entityKey] = entity
    }

    addRelated = (entity, relatedRefs) => {
        const entityKey = makeKey(entity.type, entity.id)
        this.related[entityKey] = this.related[entityKey] || {}

        map(relatedRefs, relatedRef => {
            const relationshipKey = makeKey(relatedRef.type, relatedRef.id)
            this.relationships[entityKey][relationshipKey] = relatedRef
        })
    }

    getEntity = (type, id) => {
        const key = makeKey(type, id)
        return this.entities[key]
    }

    getRelated = (type, id) => {
        const key = makeKey(type, id)
        return this.related[key]
    }

    getDenormalized = (type, id) => {
        const key = makeKey(type, id)
        return this.denormalized[key]
    }

    hasDataChanged = (ref, entityStore) => {
        const related = this.getRelated(ref.type, ref.id) || {}
        const toCheck = [ref].concat(Object.values(related))
        return toCheck.reduce((memo, { type, id }) => {
            const hasChanged =
                this.getEntity(type, id) !== get(entityStore, [type, id])
            return hasChanged || memo
        }, false)
    }
}

const entityCache = new EntityCache()

export default function denormalizeWithCache(reference, entityStore, dataKey) {
    const refs = reference.entities
    return refs.map(ref => {
        if (!(ref && ref.type && ref.id)) {
            return undefined
        }

        const hasDataChanged = entityCache.hasDataChanged(ref, entityStore)
        if (!hasDataChanged) {
            return entityCache.getDenormalized(ref.type, ref.id)
        } else {
            return denormalize(ref, entityStore)
        }
    })
}

function denormalize(ref, entityStore) {
    if (!(ref && ref.type && ref.id)) {
        return undefined
    }

    let { type, id } = ref

    // Check to see if the underlying data has changed for the ref, if not - we'll return the
    // cached immutable denormalized version, otherwise we'll construct a new denormalized portion
    // and update the related refs that are part of this ref's dependency tree
    const hasDataChanged = entityCache.hasDataChanged(ref, entityStore)
    if (!hasDataChanged) {
        return entityCache.getDenormalized(ref.type, ref.id)
    }

    // Otherwise, fetch the entity from the entity store
    const entity = get(entityStore, [type, id])
    if (entity === undefined) {
        return undefined
    }

    // Construct the new base denormalized object and add it to the existing denormalized cache
    let obj = Immutable({
        id,
        type,
        ...camelizeKeys(entity.attributes),
    })
    entityCache.addDenormalized(type, id, obj)

    // Now map over the relationships, accruing a list of related refs that we check for changes
    // against
    let relatedRefs = {}
    const relationships = get(entity, 'relationships', {})
    map(relationships, (relationship, key) => {
        const refOrRefs = relationship.data // The { id, type } pointers stored on 'data' key
        const camelizedKey = camelize(key)

        if (refOrRefs === null) {
            obj = obj.set(camelizedKey, null)
            return
        } else if (!Array.isArray(refOrRefs)) {
            const { denormalized, related } = denormalize(
                refOrRefs,
                entityStore,
            )
            obj = obj.set(camelizedKey, denormalized)
            relatedRefs = { ...relatedRefs, ...related }
        } else {
            obj = obj.set(
                camelizedKey,
                refOrRefs.map(_ref => {
                    const { denormalized, related } = denormalize(
                        _ref,
                        entityStore,
                    )
                    relatedRefs = { ...relatedRefs, ...related }
                    return denormalized
                }),
            )
        }

        // Establish a "_ref" property on the relationship object, that acts as a pointer to the
        // original entity
        obj = obj.set([camelizedKey, '_ref'], relationship)
    })

    // Establish a "_ref" property on the object, that acts as a pointer to the original entity
    if (!obj._ref) {
        obj = obj.set('_ref', { value: { data: { id, type } } })
    }

    entityCache.addEntity(entity)
    entityCache.addRelated(entity, relatedRefs)

    return { denormalized: obj, related: relatedRefs }
}
