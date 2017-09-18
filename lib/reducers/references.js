'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends7 = require('babel-runtime/helpers/extends');

var _extends8 = _interopRequireDefault(_extends7);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _types = require('../actions/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initialState = {};

// Yes, a bit funny - but it turns out this is a safe, fast, and terse way of deep cloning data
var clone = function clone(input) {
    return JSON.parse(JSON.stringify(input));
};

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
    return Object.keys(state).reduce(function (memo, dataKey) {
        var oldEntities = (0, _lodash2.default)(state[dataKey], 'entities');

        if (Array.isArray(oldEntities)) {
            memo[dataKey] = (0, _extends8.default)({}, state[dataKey], {
                entities: oldEntities.filter(function (entity) {
                    return !(entity.type === type && entity.id === id);
                })
            });
        } else {
            memo[dataKey] = state[dataKey];
        }
        return memo;
    }, {});
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
                return (0, _extends8.default)({}, state, (0, _defineProperty3.default)({}, action.meta.dataKey, (0, _extends8.default)({}, nextPageRef, {
                    isCollection: true, // hack for now, needs a better solution
                    entities: oldEntities.concat(nextPageRef.entities)
                })));
            } else if (action.meta.refToDelete) {
                // Else, if the result of a DELETE request, we must process delete corresponding refs
                // off of the references state
                return (0, _extends8.default)({}, deleteRefFromEntities(action.meta.refToDelete, state));
                // Otherwise, append or update the ref to the state
            } else if (action.payload) {
                return (0, _extends8.default)({}, state, (0, _defineProperty3.default)({}, action.meta.dataKey, action.payload.responseData.entryRef));
                // Otherwise, the data returned was undefined
            } else {
                return (0, _extends8.default)({}, state, (0, _defineProperty3.default)({}, action.meta.dataKey, undefined));
            }

        // Initialize a new dataKey from a ref passed to a child component
        case _types.INITIALIZE_DATAKEY:
            return (0, _extends8.default)({}, state, (0, _defineProperty3.default)({}, action.meta.dataKey, clone(action.payload.ref)));

        // Update a reference attached to a dataKey explicitly
        case _types.UPDATE_REF:
            return (0, _extends8.default)({}, state, (0, _defineProperty3.default)({}, action.meta.dataKey, clone(action.payload.ref)));

        default:
            return state;
    }
};

exports.default = refsReducer;
module.exports = exports['default'];