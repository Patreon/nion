'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

var _types = require('../actions/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initialState = (0, _seamlessImmutable2.default)({});

var requestsReducer = function requestsReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    switch (action.type) {
        case _types.NION_API_REQUEST:
            return state.merge((0, _defineProperty3.default)({}, action.meta.dataKey, {
                isLoading: true,
                isProcessing: action.meta.isProcessing,
                pending: action.meta.method,
                status: 'pending',
                statusCode: undefined
            }), { deep: true });
        case _types.NION_API_SUCCESS:
            return state.merge((0, _defineProperty3.default)({}, action.meta.dataKey, {
                fetchedAt: action.meta.fetchedAt,
                isError: false,
                isLoaded: true,
                isLoading: false,
                isProcessing: action.meta.isProcessing,
                status: 'success',
                statusCode: action.meta.statusCode
            }), { deep: true });
        case _types.NION_API_FAILURE:
            return state.merge((0, _defineProperty3.default)({}, action.meta.dataKey, {
                errors: action.payload.errors,
                fetchedAt: action.meta.fetchedAt,
                isError: true,
                isLoaded: false,
                isLoading: false,
                isProcessing: action.meta.isProcessing,
                name: action.payload.name,
                pending: undefined,
                status: 'error',
                statusCode: action.meta.statusCode
            }), { deep: true });
        default:
            return state;
    }
};

exports.default = requestsReducer;
module.exports = exports['default'];