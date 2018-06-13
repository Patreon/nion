function relationDoesMatch(relation, id, type) {
    return relation.id === id && relation.type === type
}

export function updateRelationships(
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

export function relationBelongsToEntity(entity, relationshipName, id, type) {
    return entity.relationships[relationshipName].find(relation =>
        relationDoesMatch(relation, id, type),
    )
}
