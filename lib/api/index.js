'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _url = require('../url');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var noop = function noop() {}; // The singleton class that will manage all of nion's API modules. API modules handle URL building,
// request generation, and response parsing, supplying correctly formed action/payloads to the nion
// core reducers.

var ApiManager = function ApiManager() {
    var _this = this;

    (0, _classCallCheck3.default)(this, ApiManager);
    this.apiMap = {};
    this.defaultApiType = null;
    this.defaultApiUrl = null;
    this.csrfProvider = null;

    this.getApiModule = function (apiType) {
        if (_this.apiMap[apiType]) {
            return _this.apiMap[apiType];
        } else if (!apiType) {
            return _this.apiMap[_this.getDefaultApi()];
        }
        throw new Error('API type ' + apiType + ' is not registered with nion. Add a corresponding apiModule to nion.configureNion');
    };

    this.getRequestParameters = function (apiType, method, options) {
        return _this.getApiModule(apiType).request.getRequestParameters(method, options, _this.csrfProvider);
    };

    this.getRequestHooks = function (apiType) {
        var _getApiModule$request = _this.getApiModule(apiType).request,
            afterRequest = _getApiModule$request.afterRequest,
            beforeRequest = _getApiModule$request.beforeRequest;

        return {
            afterRequest: afterRequest ? afterRequest : function () {
                return Promise.resolve();
            },
            beforeRequest: beforeRequest ? beforeRequest : function () {
                return Promise.resolve();
            }
        };
    };

    this.getBuildUrl = function (apiType) {
        return _this.getApiModule(apiType).buildUrl(_this.defaultApiUrl);
    };

    this.getErrorClass = function (apiType) {
        return _this.getApiModule(apiType).ErrorClass;
    };

    this.getPagination = function (apiType) {
        return _this.getApiModule(apiType).pagination || noop;
    };

    this.getParser = function (apiType) {
        return _this.getApiModule(apiType).parser;
    };

    this.getDefaultApi = function () {
        return _this.defaultApiType;
    };

    this.registerApi = function (name, api) {
        _this.apiMap[name] = api;

        // Attach the namespaced buildUrl method to the exported buildUrl method (experimental)
        _url.buildUrl[name] = api.buildUrl;
    };

    this.setDefaultApi = function (name) {
        if (name) {
            _this.defaultApiType = name;
        } else {
            _this.defaultApiType = Object.keys(_this.apiMap)[0];
        }
    };

    this.setDefaultApiUrl = function (url) {
        _this.defaultApiUrl = url;
    };

    this.setCsrfProvider = function (csrfProvider) {
        if (csrfProvider) {
            _this.csrfProvider = csrfProvider;
        }
    };
};

exports.default = new ApiManager();
module.exports = exports['default'];