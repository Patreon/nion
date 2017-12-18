'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ensureLinkHasProtocol = undefined;

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Add a protocol to link URLs if there isn't one
var ensureLinkHasProtocol = exports.ensureLinkHasProtocol = function ensureLinkHasProtocol(link) {
    var urlMap = _url2.default.parse(link);
    var locationProtocol = (0, _lodash2.default)(document, 'location.protocol');
    var linkProtocol = locationProtocol === ':' ? 'http:' : locationProtocol;

    if (!(0, _lodash2.default)(urlMap, 'protocol')) {
        return linkProtocol + '//' + urlMap.path + (urlMap.hash || '');
    } else {
        return link;
    }
};