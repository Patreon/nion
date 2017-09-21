'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _types = require('../actions/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initialState = (0, _seamlessImmutable2.default)({});

var deleteRefFromEntities = function deleteRefFromEntities() {
    var refToDelete = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var type = refToDelete.type,
        id = refToDelete.id;

    if (!id || !type) {
        return state;
    }

    // Iterate over all dataKeys on state to remove all instance of the
    // ref to be deleted
    Object.keys(state).forEach(function (dataKey) {
        var oldEntities = (0, _lodash2.default)(state[dataKey], 'entities');

        if (Array.isArray(oldEntities)) {
            var filtered = oldEntities.filter(function (entity) {
                return !(entity.type === type && entity.id === id);
            });
            state = state.setIn([dataKey, 'entities'], filtered);
        }
    });
    return state;
};

var refsReducer = function refsReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    switch (action.type) {
        case _types.NION_API_REQUEST:
            return state;
        case _types.NION_API_BOOTSTRAP:
        case _types.NION_API_SUCCESS:
            // If the result of a paginated nextPage request, we're going to want to append the
            // retrieved entities to the end of the current entities list
            if (action.meta.isNextPage || action.meta.append) {
                var nextPageRef = action.payload.responseData.entryRef;
                var oldEntities = (0, _lodash2.default)(state[action.meta.dataKey], 'entities', []);
                return state.merge((0, _defineProperty3.default)({}, action.meta.dataKey, (0, _extends3.default)({}, nextPageRef, {
                    isCollection: true,
                    entities: oldEntities.concat(nextPageRef.entities)
                })));
            } else if (action.meta.refToDelete) {
                // Else, if the result of a DELETE request, we must process delete corresponding
                // refs off of the references state
                return deleteRefFromEntities(action.meta.refToDelete, state);
                // Otherwise, append or update the ref to the state
            } else if (action.payload) {
                return state.set(action.meta.dataKey, action.payload.responseData.entryRef);
                // Otherwise, the data returned was undefined
            } else {
                return state.set(action.meta.dataKey, undefined);
            }

        // Initialize a new dataKey from a ref passed to a child component
        case _types.INITIALIZE_DATAKEY:
            return state.set(action.meta.dataKey, action.payload.ref);

        // Update a reference attached to a dataKey explicitly
        case _types.UPDATE_REF:
            return state.set(action.meta.dataKey, action.payload.ref);

        default:
            return state;
    }
};

exports.default = refsReducer;
module.exports = exports['default'];