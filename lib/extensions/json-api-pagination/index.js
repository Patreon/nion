'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash.mapvalues');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    generateActions: function generateActions(options, resource) {
        var extra = resource.extra;

        // Generate pagination functions from available links

        return (0, _lodash2.default)(extra.links, function (link, key) {
            return {
                method: 'GET',
                params: { endpoint: link }
            };
        });
    }
};
module.exports = exports['default'];