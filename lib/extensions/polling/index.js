'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.intervalMap = undefined;

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var intervalMap = exports.intervalMap = {};

exports.default = {
    generateActions: function generateActions(options, resource) {
        var key = options.key,
            delay = options.delay;


        return {
            pollStart: function pollStart(params, actionOptions) {
                intervalMap[key] = setInterval(function () {
                    return resource.actions.get(params, actionOptions);
                }, delay);
            },

            pollStop: function pollStop() {
                clearInterval(intervalMap[key]);
                intervalMap[key] = null;
            }
        };
    },

    generateMeta: function generateMeta(options, resource) {
        return {
            isPolling: function isPolling() {
                return (0, _lodash2.default)(intervalMap, options.key) ? true : false;
            }
        };
    }
};