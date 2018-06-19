"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ExtensionManager = function ExtensionManager() {
    var _this = this;

    (0, _classCallCheck3.default)(this, ExtensionManager);
    this.extensionMap = {};

    this.validateExtension = function (extension) {
        if (!extension.composeActions || !extension.composeMeta) {
            throw new Error("Extension \"" + name + "\" isn't correctly shaped. It should generate both actions and meta values, even if they're just empty objects.");
        }
        return true;
    };

    this.validateName = function (name) {
        if (!name.match(/^[a-z][a-zA-Z0-9]+$/)) {
            throw new Error("\"" + name + "\" isn't an acceptable extension name. Use alphanumeric characters only and start with lowercase letter.");
        }
        return true;
    };

    this.getExtension = function (name) {
        if (_this.extensionMap[name]) {
            return _this.extensionMap[name];
        }
        throw new Error("Extension \"" + name + "\" is not registered with nion. Add a corresponding extension module to nion.configureNion");
    };

    this.composeActionsForExtension = function (name, options, resource) {
        return _this.getExtension(name).composeActions(options, resource);
    };

    this.composeMetaForExtension = function (name, options, resource) {
        return _this.getExtension(name).composeMeta(options, resource);
    };

    this.registerExtension = function (name, extension) {
        if (_this.validateExtension(extension) && _this.validateName(name)) {
            _this.extensionMap[name] = extension;
        }
    };
};

exports.default = new ExtensionManager();
module.exports = exports["default"];