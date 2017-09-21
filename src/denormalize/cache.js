import get from 'lodash.get'
import map from 'lodash.map'

const makeKey = (type, id) => `${type}:${id}`

class DenormalizationCache {
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

const denormalizationCache = new DenormalizationCache()
export default denormalizationCache
