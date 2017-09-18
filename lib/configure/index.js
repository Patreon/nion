'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _reducers = require('../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _api = require('../api');

var _api2 = _interopRequireDefault(_api);

var _lodash = require('lodash.map');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
    var apiModules = _ref.apiModules,
        defaultApi = _ref.defaultApi;

    if (apiModules) {
        (0, _lodash2.default)(apiModules, function (apiModule, name) {
            _api2.default.registerApi(name, apiModule);
        });

        _api2.default.setDefaultApi(defaultApi);
    }

    return {
        reducer: _reducers2.default
    };
};

module.exports = exports['default'];