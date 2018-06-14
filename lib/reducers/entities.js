'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _types = require('../actions/types');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initialState = (0, _seamlessImmutable2.default)({});

// The core reducer for maintaining a normalized entity store of entities that are fetched / updated
// between different JSON API actions
var entitiesReducer = function entitiesReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    switch (action.type) {
        case _types.NION_API_SUCCESS:
        case _types.NION_API_BOOTSTRAP:
            {
                var storeFragment = (0, _lodash2.default)(action, 'payload.responseData.storeFragment', {});

                var nextState = state.merge(storeFragment, { deep: true });

                // Handle deletion
                var refToDelete = (0, _lodash2.default)(action, 'meta.refToDelete');
                if (refToDelete && refToDelete.id !== undefined && refToDelete.type) {
                    var type = refToDelete.type,
                        id = refToDelete.id;

                    var exists = nextState[type] && nextState[type][id] !== undefined;
                    if (exists) {
                        var removed = _seamlessImmutable2.default.without(nextState[type], id);
                        nextState = nextState.set(type, removed);
                    }

                    nextState = (0, _utils.filterRelationshipsFromState)(nextState, id, type);
                }
                return nextState;
            }
        case _types.UPDATE_ENTITY:
            {
                var _action$payload = action.payload,
                    _type = _action$payload.type,
                    _id = _action$payload.id,
                    attributes = _action$payload.attributes;

                var entity = state[_type][_id];
                var newAttributes = (0, _extends3.default)({}, entity.attributes, attributes);

                return state.setIn([_type, _id, 'attributes'], newAttributes);
            }
        default:
            return state;
    }
};

exports.default = entitiesReducer;
module.exports = exports['default'];