'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.urlBuilder = exports.buildUrl = exports.JsonApiPayload = exports.jsonApiModule = exports.apiModule = exports.initializeNionDevTool = exports.bootstrapNion = exports.configureNion = exports.actions = exports.makeRef = exports.selectResourcesForKeys = exports.selectRequest = exports.selectData = exports.exists = undefined;

var _actions = require('./actions');

Object.defineProperty(exports, 'actions', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_actions).default;
    }
});

var _configure = require('./configure');

Object.defineProperty(exports, 'configureNion', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_configure).default;
    }
});

var _bootstrap = require('./bootstrap');

Object.defineProperty(exports, 'bootstrapNion', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_bootstrap).default;
    }
});

var _devtool = require('./devtool');

Object.defineProperty(exports, 'initializeNionDevTool', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_devtool).default;
    }
});

var _api = require('./nion-modules/api');

Object.defineProperty(exports, 'apiModule', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_api).default;
    }
});

var _jsonApi = require('./nion-modules/json-api');

Object.defineProperty(exports, 'jsonApiModule', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_jsonApi).default;
    }
});
Object.defineProperty(exports, 'JsonApiPayload', {
    enumerable: true,
    get: function get() {
        return _jsonApi.JsonApiPayload;
    }
});

var _url = require('./url');

Object.defineProperty(exports, 'buildUrl', {
    enumerable: true,
    get: function get() {
        return _url.buildUrl;
    }
});
Object.defineProperty(exports, 'urlBuilder', {
    enumerable: true,
    get: function get() {
        return _url.urlBuilder;
    }
});

var _decorator = require('./decorator');

var decoratorHelpers = _interopRequireWildcard(_decorator);

var _selectors = require('./selectors');

var selectors = _interopRequireWildcard(_selectors);

var _transforms = require('./transforms');

var transforms = _interopRequireWildcard(_transforms);

var _configure2 = _interopRequireDefault(_configure);

var _api2 = _interopRequireDefault(_api);

var _jsonApi2 = _interopRequireDefault(_jsonApi);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// We'll be setting up a default API module (api)
(0, _configure2.default)({
    apiModules: {
        api: _api2.default,
        jsonApi: _jsonApi2.default
    },
    defaultApi: 'jsonApi'
});

var exists = decoratorHelpers.exists;
exports.exists = exists;
var selectData = selectors.selectData,
    selectRequest = selectors.selectRequest,
    selectResourcesForKeys = selectors.selectResourcesForKeys;
exports.selectData = selectData;
exports.selectRequest = selectRequest;
exports.selectResourcesForKeys = selectResourcesForKeys;
var makeRef = transforms.makeRef;
exports.makeRef = makeRef;
exports.default = decoratorHelpers.default;