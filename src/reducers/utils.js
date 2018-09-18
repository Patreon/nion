import get from 'lodash.get'
import Immutable from 'seamless-immutable'
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
    const relationships = Immutable.getIn(state, [
        entityName,
        entityId,
        'relationships',
        relationshipName,
        'data',
    ])

    const updated = relationships.filter(
        relation => !relationDoesMatch(relation, id, type),
    )

    return state.setIn(
        [entityName, entityId, 'relationships', relationshipName, 'data'],
        updated,
    )
}

function relationBelongsToEntity(entity, relationshipName, id, type) {
    const relationshipData =
        get(entity, `relationships[${relationshipName}].data`) || []
    return relationshipData.find(relation =>
        relationDoesMatch(relation, id, type),
    )
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
