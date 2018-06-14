import get from 'lodash.get'
function relationDoesMatch(relation, id, type) {
    return relation.id === id && relation.type === type
}

function updateRelationships(
    state,
    entityName,
    entityId,
    relationshipName,
    id,
    type,
) {
    return state.setIn(
        [entityName, entityId, 'relationships', relationshipName],
        value =>
            value.filter(relation => !relationDoesMatch(relation, id, type)),
    )
}

function relationBelongsToEntity(entity, relationshipName, id, type) {
    return get(
        entity,
        `relationships[${relationshipName}].data`,
        [],
    ).find(relation => relationDoesMatch(relation, id, type))
}

export function filterRelationshipsFromState(state, id, type) {
    let nextState = state
    // now go through each entity in store, then their relationships
    // if any relationships have a type of ${reftodelete.type}
    // filter those relationships
    const entityNames = Object.keys(nextState)
    entityNames.forEach(entityName => {
        const entityIndex = nextState[entityName]
        for (const entityId in entityIndex) {
            if (!entityIndex.hasOwnProperty(entityId)) {
                return
            }
            const entity = entityIndex[entityId]
            for (const relationshipName in entity.relationships) {
                if (
                    relationBelongsToEntity(entity, relationshipName, id, type)
                ) {
                    nextState = updateRelationships(
                        nextState,
                        entityName,
                        entityId,
                        relationshipName,
                        id,
                        type,
                    )
                }
            }
        }
    })

    return nextState
}
