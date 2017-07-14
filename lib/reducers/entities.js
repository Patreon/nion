'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends4 = require('babel-runtime/helpers/extends');

var _extends5 = _interopRequireDefault(_extends4);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.map');

var _lodash4 = _interopRequireDefault(_lodash3);

var _types = require('../actions/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initialState = {};

// The core reducer for maintaining a normalized entity store of entities that are fetched / updated
// between different JSON API actions
var entitiesReducer = function entitiesReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    switch (action.type) {
        case _types.NION_API_SUCCESS:
        case _types.NION_API_BOOTSTRAP:
            {
                var newState = (0, _extends5.default)({}, state);

                var storeFragment = (0, _lodash2.default)(action, 'payload.responseData.storeFragment', {});
                (0, _lodash4.default)(storeFragment, function (entities, type) {
                    newState[type] = (0, _extends5.default)({}, (0, _lodash2.default)(newState, type, {}));

                    (0, _lodash4.default)(entities, function (entity, id) {
                        newState[type][id] = {
                            type: type,
                            id: id,
                            attributes: (0, _extends5.default)({}, (0, _lodash2.default)(newState[type][id], 'attributes', {}), (0, _lodash2.default)(entity, 'attributes', {})),
                            relationships: (0, _extends5.default)({}, (0, _lodash2.default)(newState[type][id], 'relationships', {}), (0, _lodash2.default)(entity, 'relationships', {}))
                        };
                    });
                });

                var entityToDelete = (0, _lodash2.default)(action, 'meta.refToDelete');
                if (entityToDelete && entityToDelete.id !== undefined && entityToDelete.type) {
                    delete newState[entityToDelete.type][entityToDelete.id];
                }
                return newState;
            }
        case _types.UPDATE_ENTITY:
            {
                var _action$payload = action.payload,
                    type = _action$payload.type,
                    id = _action$payload.id,
                    attributes = _action$payload.attributes;

                var entity = state[type][id];
                var newEntity = (0, _extends5.default)({}, entity, {
                    attributes: (0, _extends5.default)({}, entity.attributes, attributes)
                });

                var _newState = (0, _extends5.default)({}, state, (0, _defineProperty3.default)({}, type, (0, _extends5.default)({}, state[type], (0, _defineProperty3.default)({}, id, newEntity))));

                return _newState;
            }
        default:
            return state;
    }
};

exports.default = entitiesReducer;
module.exports = exports['default'];