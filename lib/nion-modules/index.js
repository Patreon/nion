'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsonApi = exports.apiNionModule = undefined;

var _api = require('./api');

Object.defineProperty(exports, 'apiNionModule', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_api).default;
  }
});

var _jsonApi = require('./json-api');

Object.defineProperty(exports, 'jsonApi', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_jsonApi).default;
  }
});

var _api2 = _interopRequireDefault(_api);

var _jsonApi2 = _interopRequireDefault(_jsonApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }