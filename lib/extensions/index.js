'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _lodash = require('lodash.map');

var _lodash2 = _interopRequireDefault(_lodash);

var _manifest = require('./manifest');

var includedExtensions = _interopRequireWildcard(_manifest);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ExtensionManager = function ExtensionManager() {
    var _this = this;

    (0, _classCallCheck3.default)(this, ExtensionManager);
    this.extensionMap = {};

    this.getExtension = function (name) {
        if (_this.extensionMap[name]) {
            return _this.extensionMap[name];
        }
        throw new Error('Extension "' + name + '" is not registered with nion. Add a corresponding extension module to nion.configureNion');
    };

    this.composeActionsForExtension = function (name, options, resource) {
        return _this.getExtension(name).composeActions(options, resource);
    };

    this.composeMetaForExtension = function (name, options, resource) {
        return _this.getExtension(name).composeMeta(options, resource);
    };

    this.registerExtension = function (name, extension) {
        _this.extensionMap[name] = extension;
    };

    (0, _lodash2.default)(includedExtensions, function (extension, name) {
        if (!extension.composeActions || !extension.composeMeta) {
            throw new Error('Extension "' + name + '" isn\'t correctly shaped. It should generate both actions and meta values, even if they\'re just empty objects.');
        }
        _this.registerExtension(name, extension);
    });
};

exports.default = new ExtensionManager();
module.exports = exports['default'];