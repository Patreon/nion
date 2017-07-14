'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.JsonApiPayload = exports.isJsonApi = undefined;

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _buildUrl = require('./build-url');

var _buildUrl2 = _interopRequireDefault(_buildUrl);

var _error = require('./error');

var _error2 = _interopRequireDefault(_error);

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _pagination = require('./pagination');

var pagination = _interopRequireWildcard(_pagination);

var _request = require('./request');

var request = _interopRequireWildcard(_request);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isJsonApi = exports.isJsonApi = function isJsonApi(object) {
    return !!(0, _lodash2.default)(object, 'data');
};

var JsonApiPayload = exports.JsonApiPayload = request.JsonApiPayload;

exports.default = {
    buildUrl: _buildUrl2.default,
    isJsonApi: isJsonApi,
    ErrorClass: _error2.default,
    pagination: pagination,
    parser: _parser2.default,
    request: request
};