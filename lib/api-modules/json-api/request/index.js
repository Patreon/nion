'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// Simple pre/post request hooks (must return a promise) and a request parameter helper
var beforeRequest = exports.beforeRequest = function beforeRequest(method, options) {
    return Promise.resolve();
};

var afterRequest = exports.afterRequest = function afterRequest(method, options) {
    return Promise.resolve();
};

var defaultHeaders = exports.defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json, application/xml, text/plain, text/html, *.*'
};

var getRequestParameters = exports.getRequestParameters = function getRequestParameters(_method) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$declaration = _ref.declaration,
        declaration = _ref$declaration === undefined ? {} : _ref$declaration;

    return {
        headers: declaration.headers || defaultHeaders
    };
};