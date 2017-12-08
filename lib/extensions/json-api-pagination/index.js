'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.mapvalues');

var _lodash4 = _interopRequireDefault(_lodash3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    composeActions: function composeActions(options, resource) {
        var _options$append = options.append,
            append = _options$append === undefined ? false : _options$append;
        var actions = resource.actions,
            extra = resource.extra;

        // Generate an action for each available link on the resource

        return (0, _lodash4.default)(extra.links, function (link, key) {
            switch (key) {
                case 'next':
                    return function (params, actionOptions) {
                        return actions.get((0, _extends3.default)({}, params, { endpoint: link }), (0, _extends3.default)({}, actionOptions, { append: append }));
                    };
                    break;
                default:
                    return function (params, actionOptions) {
                        return actions.get((0, _extends3.default)({}, params, { endpoint: link }), actionOptions);
                    };
            }
        });
    },

    composeMeta: function composeMeta(options, resource) {
        if ((0, _lodash2.default)(resource, 'extra.links.next')) {
            return { canLoadMore: true };
        }
        return {};
    }
};
module.exports = exports['default'];