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

var requestsReducer = function requestsReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    var existing = (0, _lodash2.default)(state, 'action.meta.dataKey');

    switch (action.type) {
        case _types.NION_API_REQUEST:
            return state.merge((0, _defineProperty3.default)({}, action.meta.dataKey, (0, _extends3.default)({}, existing, {
                status: 'pending',
                isLoading: true,
                pending: action.meta.method
            })), { deep: true });
        case _types.NION_API_SUCCESS:
            return state.merge((0, _defineProperty3.default)({}, action.meta.dataKey, (0, _extends3.default)({}, existing, {
                status: 'success',
                fetchedAt: action.meta.fetchedAt,
                isError: false,
                isLoaded: true,
                isLoading: false
            })), { deep: true });
        case _types.NION_API_FAILURE:
            return state.merge((0, _defineProperty3.default)({}, action.meta.dataKey, (0, _extends3.default)({}, existing, {
                status: 'error',
                name: action.payload.name,
                errors: action.payload.errors,
                fetchedAt: action.meta.fetchedAt,
                isError: true,
                isLoaded: false,
                isLoading: false,
                pending: undefined
            })), { deep: true });
        default:
            return state;
    }
};

exports.default = requestsReducer;
module.exports = exports['default'];