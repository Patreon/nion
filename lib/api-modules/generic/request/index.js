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

var getRequestParameters = exports.getRequestParameters = function getRequestParameters(method, _ref) {
    var endpoint = _ref.endpoint,
        body = _ref.body,
        meta = _ref.meta,
        declaration = _ref.declaration;

    var defaultHeaders = {
        'Content-Type': 'application/json',
        Accept: 'application/json, application/xml, text/plain, text/html, *.*'
    };

    return {
        headers: declaration.headers || defaultHeaders
    };
};