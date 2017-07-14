'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _lodash = require('lodash.map');

var _lodash2 = _interopRequireDefault(_lodash);

var _humps = require('humps');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var JsonApiError = function (_Error) {
    (0, _inherits3.default)(JsonApiError, _Error);

    function JsonApiError(status, statusText, response) {
        (0, _classCallCheck3.default)(this, JsonApiError);

        var _this = (0, _possibleConstructorReturn3.default)(this, (JsonApiError.__proto__ || Object.getPrototypeOf(JsonApiError)).call(this));

        _this.name = 'ApiError';
        _this.status = status;
        _this.statusText = statusText;
        _this.response = response;
        _this.message = status + ' - ' + statusText;
        _this.errors = (0, _lodash2.default)(response.errors, function (e) {
            return (0, _humps.camelizeKeys)(e);
        });
        return _this;
    }

    return JsonApiError;
}(Error);

exports.default = JsonApiError;
module.exports = exports['default'];