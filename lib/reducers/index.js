'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _redux = require('redux');

var _references = require('./references');

var _references2 = _interopRequireDefault(_references);

var _requests = require('./requests');

var _requests2 = _interopRequireDefault(_requests);

var _entities = require('./entities');

var _entities2 = _interopRequireDefault(_entities);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _redux.combineReducers)({
    references: _references2.default,
    requests: _requests2.default,
    entities: _entities2.default
});
module.exports = exports['default'];