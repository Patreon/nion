'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash.map');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.get');

var _lodash4 = _interopRequireDefault(_lodash3);

var _getDefaultDeclarationOptions = require('./get-default-declaration-options');

var _getDefaultDeclarationOptions2 = _interopRequireDefault(_getDefaultDeclarationOptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var processDefaultOptions = function processDefaultOptions(declarations) {
    (0, _lodash2.default)(declarations, function (declaration, key) {
        (0, _lodash2.default)((0, _getDefaultDeclarationOptions2.default)(), function (defaultState, defaultKey) {
            var option = (0, _lodash4.default)(declaration, defaultKey, defaultState);
            declaration[defaultKey] = option;
        });
    });
};

exports.default = processDefaultOptions;
module.exports = exports['default'];