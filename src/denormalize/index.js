import get from 'lodash.get'
import set from 'lodash.set'
import map from 'lodash.map'
import merge from 'lodash.merge'
import { camelize, camelizeKeys } from 'humps'

export default function denormalize(ref, entities, existingObjects = {}) {
    if (!(ref && ref.type && ref.id)) {
        return undefined
    }

    let { type, id } = ref

    // Check the existing object to see if a reference to the denormalized object already exists,
    // if so, use the existing denormalized object
    const existingObject = get(existingObjects, [type, id])
    if (existingObject) {
        return existingObject
    }

    const entity = get(entities, [type, id])

    if (entity === undefined) {
        return undefined
    }

    // Construct the new base denormalized object and add it to the existing map
    const obj = {
        id,
        type,
        ...camelizeKeys(entity.attributes),
    }
    set(existingObjects, [type, id], obj)

    const relationships = get(entity, 'relationships', {})
    map(relationships, (relationship, key) => {
        const refOrRefs = relationship.data // The { id, type } pointers stored on 'data' key
        const camelizedKey = camelize(key)

        if (refOrRefs === null) {
            obj[camelizedKey] = null
            return
        } else if (!Array.isArray(refOrRefs)) {
            obj[camelizedKey] = denormalize(
                refOrRefs,
                entities,
                existingObjects,
            )
        } else {
            obj[camelizedKey] = refOrRefs.map(ref => {
                // eslint-disable-line
                return denormalize(ref, entities, existingObjects)
            })
        }

        // Establish a "_ref" property on the relationship object, that acts as a pointer to the
        // original entity
        if (obj[camelizedKey] && !obj[camelizedKey]._ref) {
            Object.defineProperty(obj[camelizedKey], '_ref', {
                value: merge({}, relationship),
            })
        }
    })

    // Establish a "_ref" property on the object, that acts as a pointer to the original entity
    if (!obj._ref) {
        Object.defineProperty(obj, '_ref', { value: { data: { id, type } } })
    }
    return obj
}
