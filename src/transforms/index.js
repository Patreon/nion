import map from 'lodash.map'
import every from 'lodash.every'

export const makeRef = (input = {}, options = {}) => {
    // Can pass in a plain object from selectData, since these objects get populated with a _ref to
    // their original { id, type } entity information
    const toProcess = input._ref ? input._ref : input

    // Get all relevant information off of the object to be processed
    let { links, meta, isCollection, entities } = toProcess

    // If the passed in object has a data key (from relationship, for example), use that to build
    // the new entities list
    if (toProcess.data) {
        if (toProcess.data instanceof Array) {
            entities = map(toProcess.data, ({ type, id }) => ({ type, id }))
            isCollection = true
        } else {
            const { type, id } = toProcess.data
            entities = [{ type, id }]
            isCollection = isCollection || false
        }
    } else if (toProcess.type && toProcess.id) {
        // If the input data is a flat entity, we'll need to construct a ref to that entity
        entities = [{ type: toProcess.type, id: toProcess.id }]
        isCollection = false
    } else if (isArrayOfItems(toProcess)) {
        entities = toProcess.map(item => {
            return { type: item.type, id: item.id }
        })
        isCollection = true
    } else {
        entities = []
    }

    if (options.isCollection) {
        isCollection = true
    }

    return {
        entities,
        isCollection,
        links,
        meta,
    }
}

function isArrayOfItems(items) {
    return (
        items instanceof Array &&
        every(items, item => item.id !== undefined && item.type)
    )
}
