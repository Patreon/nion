'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.urlBuilderForDefaults = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _urlFactory = require('url-factory');

var _urlFactory2 = _interopRequireDefault(_urlFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eventually make this configurable via nion api-module config interface
var CURRENT_JSON_API_VERSION = '1.0';

var urlBuilderForDefaults = exports.urlBuilderForDefaults = function urlBuilderForDefaults(apiHost, defaults) {
    return (0, _urlFactory2.default)(apiHost, (0, _extends3.default)({
        'json-api-version': CURRENT_JSON_API_VERSION
    }, defaults));
};

exports.default = function (apiHost) {
    return urlBuilderForDefaults(apiHost, { include: [] });
};