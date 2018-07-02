"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Lifecycle = undefined;

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Lifecycle = exports.Lifecycle = function () {
    function Lifecycle() {
        (0, _classCallCheck3.default)(this, Lifecycle);
    }

    (0, _createClass3.default)(Lifecycle, [{
        key: "onRequest",
        value: function onRequest(_ref) {
            var method = _ref.method,
                dataKey = _ref.dataKey,
                request = _ref.request,
                meta = _ref.meta,
                declaration = _ref.declaration;

            return this._onRequest && this._onRequest({ method: method, dataKey: dataKey, request: request, meta: meta, declaration: declaration });
        }
    }, {
        key: "onSuccess",
        value: function onSuccess(_ref2) {
            var method = _ref2.method,
                dataKey = _ref2.dataKey,
                request = _ref2.request,
                response = _ref2.response,
                meta = _ref2.meta,
                declaration = _ref2.declaration;

            return this._onSuccess && this._onSuccess({
                method: method,
                dataKey: dataKey,
                request: request,
                response: response,
                meta: meta,
                declaration: declaration
            });
        }
    }, {
        key: "onFailure",
        value: function onFailure(_ref3) {
            var method = _ref3.method,
                dataKey = _ref3.dataKey,
                error = _ref3.error,
                meta = _ref3.meta,
                declaration = _ref3.declaration;

            return this._onFailure && this._onFailure({ method: method, dataKey: dataKey, error: error, meta: meta, declaration: declaration });
        }
    }, {
        key: "onDeclare",
        value: function onDeclare(_ref4) {
            var declaration = _ref4.declaration,
                props = _ref4.props;

            return this._onDeclare && this._onDeclare({ declaration: declaration, props: props });
        }
    }, {
        key: "registerLifecycleConfig",
        value: function registerLifecycleConfig() {
            var lifecycleConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this._onRequest = lifecycleConfig.onRequest;
            this._onSuccess = lifecycleConfig.onSuccess;
            this._onFailure = lifecycleConfig.onFailure;
            this._onDeclare = lifecycleConfig.onDeclare;
        }
    }]);
    return Lifecycle;
}();

exports.default = new Lifecycle();