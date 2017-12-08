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
    composeActions: function composeActions(options, resource) {
        var key = options.key,
            delay = options.delay;


        return {
            start: function start(params, actionOptions) {
                intervalMap[key] = setInterval(function () {
                    return resource.actions.get(params, actionOptions);
                }, delay);
            },

            stop: function stop() {
                clearInterval(intervalMap[key]);
                intervalMap[key] = null;
            }
        };
    },

    composeMeta: function composeMeta(options, resource) {
        return {
            isActive: function isActive() {
                return (0, _lodash2.default)(intervalMap, options.key) ? true : false;
            }
        };
    }
};