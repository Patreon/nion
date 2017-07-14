'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.deconstructUrl = exports.urlBuilder = exports.buildUrl = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _fastUrlParser = require('fast-url-parser');

var _fastUrlParser2 = _interopRequireDefault(_fastUrlParser);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _lodash = require('lodash.map');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.includes');

var _lodash4 = _interopRequireDefault(_lodash3);

var _api = require('../api');

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_fastUrlParser2.default.queryString = _qs2.default;

var buildUrl = exports.buildUrl = function buildUrl() {
    var defaultApi = _api2.default.getDefaultApi();
    var defaultBuildUrl = _api2.default.getBuildUrl(defaultApi);
    return defaultBuildUrl.apply(undefined, arguments);
};

var urlBuilder = exports.urlBuilder = function urlBuilder() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    var defaultApi = _api2.default.getDefaultApi();
    var defaultBuildUrl = _api2.default.getBuildUrl(defaultApi);
    return function () {
        defaultBuildUrl.apply(undefined, args);
    };
};

var deconstructUrl = exports.deconstructUrl = function deconstructUrl(input) {
    var unescaped = decodeURI(input);
    var deconstructed = _fastUrlParser2.default.parse(unescaped, true);

    // Deal with the (silly) way arrays are handled
    // https://github.com/Patreon/url-factory/blob/master/src/index.js#L4
    (0, _lodash2.default)(deconstructed.query, function (item, key) {
        // Handle the string-encoded empty array
        if (item === '[]') {
            deconstructed.query[key] = [];
            // Handle the fact that [ 'a', 'b' ] is encoded as "a,b"
        } else if ((0, _lodash4.default)(item, ',')) {
            deconstructed.query[key] = item.split(',');
            // Handle the fact that [ 'a' ] is encoded as "a"
        } else if (key === 'include' && item.length) {
            deconstructed.query[key] = [item];
        }
    });

    return (0, _extends3.default)({}, deconstructed, {
        options: deconstructed.query
    });
};