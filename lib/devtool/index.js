'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = initializeNionDevTool;

var _selectors = require('../selectors');

function initializeNionDevTool(store) {
    if (window) {
        window.nion = {
            selectData: function selectData(key) {
                return (0, _selectors.selectData)(key)(store.getState());
            }
        };
    }
}
module.exports = exports['default'];