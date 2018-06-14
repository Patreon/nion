'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.filterRelationshipsFromState = filterRelationshipsFromState;

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    return (0, _lodash2.default)(entity, 'relationships[' + relationshipName + '].data', []).find(function (relation) {
        return relationDoesMatch(relation, id, type);
    });
}

function filterRelationshipsFromState(state, id, type) {
    var nextState = state;
    // now go through each entity in store, then their relationships
    // if any relationships have a type of ${reftodelete.type}
    // filter those relationships
    var entityNames = Object.keys(nextState);
    entityNames.forEach(function (entityName) {
        var entityIndex = nextState[entityName];
        for (var entityId in entityIndex) {
            if (!entityIndex.hasOwnProperty(entityId)) {
                return;
            }
            var entity = entityIndex[entityId];
            for (var relationshipName in entity.relationships) {
                if (relationBelongsToEntity(entity, relationshipName, id, type)) {
                    nextState = updateRelationships(nextState, entityName, entityId, relationshipName, id, type);
                }
            }
        }
    });

    return nextState;
}