'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getNextUrl = exports.canLoadMore = undefined;

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var canLoadMore = exports.canLoadMore = function canLoadMore(data) {
    return !!(0, _lodash2.default)(data, 'links.next') && !(0, _lodash2.default)(data, 'request.isLoading');
};

var getNextUrl = exports.getNextUrl = function getNextUrl(declaration, selectedData) {
    var nextUrl = (0, _lodash2.default)(selectedData, ['links', 'next'], null);
    return nextUrl;
};