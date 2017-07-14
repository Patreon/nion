'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var titleFormatter = exports.titleFormatter = function titleFormatter(action, time, took) {
    var actionString = action.type.toString();
    if (actionString.indexOf('Symbol(nion/NION_API') === 0) {
        actionString = actionString.replace('Symbol(', '').replace(')', '/' + action.meta.dataKey);
    }

    return 'action ' + actionString + ' (in ' + took.toFixed(2) + ' ms)';
};