'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash.map');

var _lodash2 = _interopRequireDefault(_lodash);

var _api = require('../api');

var _api2 = _interopRequireDefault(_api);

var _actions = require('../actions');

var _actions2 = _interopRequireDefault(_actions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var clone = function clone(input) {
    return JSON.parse(JSON.stringify(input));
};

var bootstrap = function bootstrap(store, bootstrapObj) {
    var apiType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _api2.default.getDefaultApi();

    // Iterate over the bootstrap object with format { [dataKey]: <data> }
    (0, _lodash2.default)(bootstrapObj, function (data, dataKey) {
        // Only dispatch data that is JSON-API compliant using the jsonApi action creators
        var clonedData = clone(data);
        store.dispatch(_actions2.default.bootstrap({ apiType: apiType, dataKey: dataKey, data: clonedData }));
    });
};

exports.default = bootstrap;
module.exports = exports['default'];