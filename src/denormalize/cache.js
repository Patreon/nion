import get from 'lodash/get'
import map from 'lodash/map'

export const makeKey = (type, id) => `${type}:${id}`

class DenormalizationCache {
    denormalized = {}
    manifests = {}
    entities = {}

    initializeManifest = ref => {
        const { type, id } = ref
        const key = makeKey(type, id)
        return { [key]: ref }
    }

    addDenormalized = (type, id, data) => {
        const key = makeKey(type, id)
        this.denormalized[key] = data
    }

    addEntity = entity => {
        const entityKey = makeKey(entity.type, entity.id)
        this.entities[entityKey] = entity
    }

    addManifest = (entity, manifest) => {
        const entityKey = makeKey(entity.type, entity.id)
        this.manifests[entityKey] = this.manifests[entityKey] || {}

        map(manifest, relatedRef => {
            const relationshipKey = makeKey(relatedRef.type, relatedRef.id)
            this.manifests[entityKey][relationshipKey] = relatedRef
        })
    }

    getEntity = (type, id) => {
        const key = makeKey(type, id)
        return this.entities[key]
    }

    getManifest = (type, id) => {
        const key = makeKey(type, id)
        return this.manifests[key]
    }

    getDenormalized = (type, id) => {
        const key = makeKey(type, id)
        return this.denormalized[key]
    }

    hasDataChanged = (ref, entityStore) => {
        if (ref.meta !== undefined) {
            return true
        }

        const manifest = this.getManifest(ref.type, ref.id) || {}
        const toCheck = [ref].concat(Object.values(manifest))

        return toCheck.some(
            ({ type, id }) =>
                this.getEntity(type, id) !== get(entityStore, [type, id]),
        )
    }
}

const denormalizationCache = new DenormalizationCache()
export default denormalizationCache
