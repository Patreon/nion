'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _lodash = require('lodash.map');

var _lodash2 = _interopRequireDefault(_lodash);

var _apiModules = require('../api-modules');

var includedApiModules = _interopRequireWildcard(_apiModules);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_API_TYPE = 'generic';

// The singleton class that will manage all of nion's API modules. API modules handle URL building,
// request generation, and response parsing, supplying correctly formed action/payloads to the nion
// core reducers.
var noop = function noop() {};

var ApiManager = function ApiManager() {
    var _this = this;

    (0, _classCallCheck3.default)(this, ApiManager);
    this.apiMap = {};
    this.defaultApiType = null;

    this.getApiModule = function (apiType) {
        if (_this.apiMap[apiType]) {
            return _this.apiMap[apiType];
        } else if (!apiType) {
            return _this.apiMap[_this.getDefaultApi()];
        }
        throw new Error('API type ' + apiType + ' is not registered with nion. Add a corresponding apiModule to nion.configureNion');
    };

    this.getRequestParameters = function (apiType, method, options) {
        return _this.getApiModule(apiType).request.getRequestParameters(method, options);
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
        return _this.getApiModule(apiType).buildUrl;
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
        // TODO: perhaps add some sort of run-time module interface checking here?
        _this.apiMap[name] = api;
    };

    this.setDefaultApi = function (name) {
        if (name) {
            _this.defaultApiType = name;
        } else {
            _this.defaultApiType = Object.keys(_this.apiMap)[0];
        }
    };

    (0, _lodash2.default)(includedApiModules, function (module, key) {
        _this.registerApi(key, module);
    });
    this.setDefaultApi(DEFAULT_API_TYPE);
};

exports.default = new ApiManager();
module.exports = exports['default'];