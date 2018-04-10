'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.makeNonExistingObject = makeNonExistingObject;
exports.makeExistingObject = makeExistingObject;
exports.defineNonEnumerable = defineNonEnumerable;
exports.getDisplayName = getDisplayName;
exports.isNotLoading = isNotLoading;
exports.isNotLoaded = isNotLoaded;
exports.getUrl = getUrl;

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.omit');

var _lodash4 = _interopRequireDefault(_lodash3);

var _constants = require('../../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeNonExistingObject() {
    var obj = {};
    Object.defineProperty(obj, '_exists', { value: false, enumerable: false });
    return obj;
}

function makeExistingObject() {
    var existingObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var obj = (0, _extends3.default)({}, existingObj);
    Object.defineProperty(obj, '_exists', {
        value: true,
        enumerable: false
    });
    return obj;
}

function defineNonEnumerable(obj, key, value) {
    Object.defineProperty(obj, key, {
        value: value,
        enumerable: false
    });
}

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function isNotLoading(status) {
    return status !== _constants.ActionStatus.PENDING;
}

function isNotLoaded(status) {
    return status === _constants.ActionStatus.NOT_CALLED;
}

// Helper method to construct a url endpoint from supplied declaration and params.
// This will be used to build the endpoints for the various method actions
function getUrl(declaration, params, buildUrl) {
    var endpoint = (0, _lodash2.default)(declaration, 'endpoint');
    // If supplied endpoint override at call time, then use the supplied endpoint
    if ((0, _lodash2.default)(params, 'endpoint')) {
        endpoint = params.endpoint;
        params = (0, _lodash4.default)(params, ['endpoint']);
    }

    // Use if a fully-formed url, otherwise pass to buildUrl
    return typeof buildUrl === 'undefined' || typeof endpoint === 'undefined' || endpoint.indexOf(_constants.HTTPS_PROTOCOL) === 0 || endpoint.indexOf(_constants.HTTP_PROTOCOL) === 0 ? endpoint : buildUrl(endpoint, params);
}