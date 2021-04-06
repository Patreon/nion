import get from 'lodash/get'
import map from 'lodash/map'

export const makeKey = (type, id) => `${type}:${id}`

class DenormalizationCache {
    denormalized = {}
    manifests = {}
    entities = {}

    initializeManifest = ref => ({ [makeKey(ref.type, ref.id)]: ref })

    addDenormalized = (type, id, data) => {
        this.denormalized[makeKey(type, id)] = data
    }

    addEntity = entity => {
        this.entities[makeKey(entity.type, entity.id)] = entity
    }

    addManifest = (entity, manifest) => {
        const entityKey = makeKey(entity.type, entity.id)

        this.manifests[entityKey] = this.manifests[entityKey] || {}

        map(manifest, relatedRef => {
            this.manifests[entityKey][
                makeKey(relatedRef.type, relatedRef.id)
            ] = relatedRef
        })
    }

    getEntity = (type, id) => this.entities[makeKey(type, id)]

    getManifest = (type, id) => this.manifests[makeKey(type, id)]

    getDenormalized = (type, id) => this.denormalized[makeKey(type, id)]

    hasDataChanged = (ref, entityStore) => {
        const manifest = this.getManifest(ref.type, ref.id) || {}
        const toCheck = [ref].concat(Object.values(manifest))

        for (let i = 0; i < toCheck.length; i++) {
            const { id, type } = toCheck[i]

            if (this.getEntity(type, id) !== get(entityStore, [type, id])) {
                return true
            }
        }

        return false
    }
}

const denormalizationCache = new DenormalizationCache()
export default denormalizationCache
