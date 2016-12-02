import get from 'lodash.get'
import set from 'lodash.set'
import map from 'lodash.map'

export default function denormalize(ref, entities, existingObjects = {}) {
    if (!(ref && ref.type && ref.id)) {
        return undefined
    }

    const { type, id } = ref

    // Check the existing object to see if a reference to the denormalized object already exists,
    // if so, use the existing denormalized object
    const existingObject = get(existingObjects, [type, id])
    if (existingObject) {
        return existingObject
    }

    const entity = get(entities, [type, id])

    // Construct the new base denormalized object and add it to the existing map
    const obj = {
        id,
        type,
        ...entity.attributes
    }
    set(existingObjects, [type, id], obj)

    const relationships = get(entity, 'relationships', {})
    map(relationships, (relationship, key) => {
        const refOrRefs = relationship.data
        if (refOrRefs === null) {
            obj[key] = null
        } else if (!Array.isArray(refOrRefs)) {
            obj[key] = denormalize(refOrRefs, entities, existingObjects)
        } else {
            obj[key] = refOrRefs.map((ref) => { // eslint-disable-line
                return denormalize(ref, entities, existingObjects)
            })
        }
    })

    return obj
}
