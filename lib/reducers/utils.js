'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updateRelationships = updateRelationships;
exports.relationBelongsToEntity = relationBelongsToEntity;
function relationDoesMatch(relation, id, type) {
    return relation.id === id && relation.type === type;
}

function updateRelationships(state, entityName, entityId, relationshipName, id, type) {
    return state.setIn([entityName, entityId, 'relationships', relationshipName], function (value) {
        return value.filter(function (relation) {
            return !relationDoesMatch(relation, id, type);
        });
    });
}

function relationBelongsToEntity(entity, relationshipName, id, type) {
    return entity.relationships[relationshipName].find(function (relation) {
        return relationDoesMatch(relation, id, type);
    });
}