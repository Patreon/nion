'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _generic = require('./generic');

Object.defineProperty(exports, 'generic', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_generic).default;
  }
});

var _jsonApi = require('./json-api');

Object.defineProperty(exports, 'jsonApi', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_jsonApi).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }