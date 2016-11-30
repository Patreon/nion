const addEntityToStoreFragment = (store, entity) => {
    if (!(entity.type in store)) {
        store[entity.type] = {}
    }
    store[entity.type][entity.id] = {
        type: entity.type,
        id: entity.id,
        attributes: entity.attributes,
        relationships: entity.relationships
    }
}

const normalizeDataEntities = (storeFragment, dataEntities) => {
    const entityList = Array.isArray(dataEntities) ? dataEntities : [dataEntities]
    entityList.map((entity) => addEntityToStoreFragment(storeFragment, entity))
}

const normalizeIncludedEntities = (storeFragment, includedEntities) => {
    includedEntities.map((entity) => addEntityToStoreFragment(storeFragment, entity))
}

const makeEntityReferences = (data) => {
    const dataList = Array.isArray(data) ? data : [data]
    return dataList.map((entity) => ({id: entity.id, type: entity.type}))
}

export default (response) => {
    const { data, included, meta, links } = response
    const newRequestRef = {
        entities: makeEntityReferences(data),
        meta,
        links
    }

    // rewrite this so that we are not mutating
    let storeFragment = {}
    normalizeDataEntities(storeFragment, data)
    normalizeIncludedEntities(storeFragment, included)
    return {
        storeFragment,
        newRequestRef
    }
}
