'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getNextUrl = exports.canLoadMore = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _buildUrl = require('../build-url');

var _buildUrl2 = _interopRequireDefault(_buildUrl);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _url = require('../../../url');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var canLoadMore = exports.canLoadMore = function canLoadMore(data) {
    return !!(0, _lodash2.default)(data, 'links.next') && !(0, _lodash2.default)(data, 'request.isLoading');
};

var getNextUrl = exports.getNextUrl = function getNextUrl(declaration, selectedData) {
    var nextUrl = processNextUrl(selectedData);

    if (!nextUrl) {
        return null;
    }

    /* We want to make sure we apply the parameters supplied in the declaration URL to the url
     * supplied via the pagination link. Most of the time, cartographer should respect our passed up
     * query parameters, but there are instances where it does not.
     * So here we take the query parameters from the api-returned nextUrl,
     * and union them with our existing endpoint.
     */

    /* Extracting only the piece of the nextUrl pathname needed to be provided to buildUrl is a little tricky,
     * but necessary for cases when the baseUrl that buildUrl is using has its own pathname portion.
     * Otherwise, the built url that this function returns will have a duplicated pathname portion,
     * e.g. https://example.com/api/api/posts
     * Our approach is to use `buildUrl('')` to find that baseUrl pathname,
     * and strip it from the beginning of the returned nextUrl pathname.
     */
    // Find buildUrl's baseUrl's pathname
    var rootApiUrl = (0, _buildUrl2.default)('');
    var rootApiPath = (0, _url.deconstructUrl)(rootApiUrl).pathname;
    // Slice off any trailing slashes
    if (rootApiPath.length > 1 && rootApiPath.endsWith('/')) {
        rootApiPath = rootApiPath.slice(0, rootApiPath.length - 1);
    }

    var _deconstructUrl = (0, _url.deconstructUrl)(nextUrl),
        pathname = _deconstructUrl.pathname,
        nextOptions = _deconstructUrl.options;
    // Strip the baseUrl's pathname off of the beginning of nextUrl's pathname


    var uniquePathPortion = pathname.replace(rootApiPath, '');

    var _deconstructUrl2 = (0, _url.deconstructUrl)(declaration.endpoint),
        declarationOptions = _deconstructUrl2.options;
    // nextOptions needs to override any duplicates with declarationOptions


    var newOptions = (0, _extends3.default)({}, declarationOptions, nextOptions);

    return (0, _buildUrl2.default)(uniquePathPortion, newOptions);
};

function processNextUrl(selectedData) {
    var nextUrl = (0, _lodash2.default)(selectedData, ['links', 'next']);

    if (!nextUrl) {
        return null;
    }

    if (!startsWith('http://') && !startsWith('https://')) {
        return 'https://' + nextUrl;
    } else {
        return nextUrl;
    }

    function startsWith(value) {
        return nextUrl.indexOf(value) === 0;
    }
}