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

// A default error class for handling nion api errors
var NionApiError = function (_Error) {
    (0, _inherits3.default)(NionApiError, _Error);

    function NionApiError(status, statusText, response) {
        (0, _classCallCheck3.default)(this, NionApiError);

        var _this = (0, _possibleConstructorReturn3.default)(this, (NionApiError.__proto__ || Object.getPrototypeOf(NionApiError)).call(this));

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

    return NionApiError;
}(Error);

exports.default = NionApiError;
module.exports = exports['default'];