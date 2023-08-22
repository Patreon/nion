export function mergeManifests(a, b) {
    for (const type in b) {
        if (b.hasOwnProperty(type)) {
            for (const id in b[type]) {
                if (b[type].hasOwnProperty(id)) {
                    a[type] = a[type] || {}
                    a[type][id] = b[type][id]
                }
            }
        }
    }

    return a
}
class DenormalizationCache {
    denorm = {}
    manifests = {}
    entities = {}

    purge = () => {
        this.denorm = {}
        this.manifests = {}
        this.entities = {}
    }

    initializeManifest = ref => ({ [ref.type]: { [ref.id]: ref } })

    addDenormalized = (type, id, data) => {
        this.denorm[type] = this.denorm[type] || {}
        this.denorm[type][id] = data
    }

    getDenormalized = (type, id) => this.denorm[type]?.[id]

    addEntity = entity => {
        this.entities[entity.type] = this.entities[entity.type] || {}
        this.entities[entity.type][entity.id] = entity
    }

    getEntity = (type, id) => this.entities[type]?.[id]

    addManifest = (entity, manifest) => {
        const { type, id } = entity

        this.manifests[type] = this.manifests[type] || {}
        this.manifests[type][id] = this.manifests[type][id] || {}

        mergeManifests(this.manifests[type][id], manifest)
    }

    getManifest = (type, id) => this.manifests[type]?.[id]

    hasDataChanged = (ref, entityStore) => {
        if (!entityStore) return true

        if (
            this.getEntity(ref.type, ref.id) !== entityStore[ref.type]?.[ref.id]
        ) {
            return true
        }

        const manifest = this.getManifest(ref.type, ref.id) || {}

        for (const entityType in manifest) {
            if (manifest.hasOwnProperty(entityType)) {
                for (const entityId in manifest[entityType]) {
                    if (manifest[entityType].hasOwnProperty(entityId)) {
                        const { type, id } = manifest[entityType][entityId]

                        if (
                            this.getEntity(type, id) !== entityStore[type]?.[id]
                        ) {
                            return true
                        }
                    }
                }
            }
        }

        return false
    }
}

const denormalizationCache = new DenormalizationCache()

export default denormalizationCache

export function purgeDenormalizationCache() {
    denormalizationCache.purge()
}
