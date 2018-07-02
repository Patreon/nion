'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _reducers = require('../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _extensions = require('../extensions');

var _extensions2 = _interopRequireDefault(_extensions);

var _api = require('../api');

var _api2 = _interopRequireDefault(_api);

var _lifecycle = require('../lifecycle');

var _lifecycle2 = _interopRequireDefault(_lifecycle);

var _lodash = require('lodash.map');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var apiModules = options.apiModules,
        defaultApi = options.defaultApi,
        extensions = options.extensions,
        lifecycleConfig = options.lifecycleConfig;


    if (apiModules) {
        (0, _lodash2.default)(apiModules, function (apiModule, name) {
            _api2.default.registerApi(name, apiModule);
        });

        _api2.default.setDefaultApi(defaultApi);
    }

    if (extensions) {
        (0, _lodash2.default)(extensions, function (extension, name) {
            _extensions2.default.registerExtension(name, extension);
        });
    }

    if (lifecycleConfig) {
        _lifecycle2.default.registerLifecycleConfig(lifecycleConfig);
    }

    return {
        reducer: _reducers2.default
    };
};

module.exports = exports['default'];