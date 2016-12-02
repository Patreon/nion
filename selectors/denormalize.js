import get from 'lodash.get'
import set from 'lodash.set'
import map from 'lodash.map'

export default function denormalize(ref, entities, bag = {}) {
    if (!(ref && ref.type && ref.id)) {
        return undefined
    }

    const { type, id } = ref

    const existing = get(bag, [type, id])
    if (existing) {
        return existing
    }

    const entity = get(entities, [type, id])

    const obj = {
        id,
        type,
        ...entity.attributes
    }

    set(bag, [type, id], obj)

    const relationships = get(entity, 'relationships', {})
    map(relationships, (relationship, key) => {
        const refOrRefs = relationship.data
        if (refOrRefs === null) {
            obj[key] = null
        } else if (!Array.isArray(refOrRefs)) {
            obj[key] = denormalize(refOrRefs, entities, bag)
        } else {
            obj[key] = refOrRefs.map((ref) => { // eslint-disable-line
                return denormalize(ref, entities, bag)
            })
        }
    })

    return obj
}
