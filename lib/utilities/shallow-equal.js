'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.default = shallowEqual;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// shallow equal from fbjs
// https://github.com/reactjs/react-redux/blob/master/src/utils/shallowEqual.js
// modified to ignore the "nion" prop

var hasOwn = Object.prototype.hasOwnProperty;

function is(x, y) {
    if (x === y) {
        return x !== 0 || y !== 0 || 1 / x === 1 / y;
    } else {
        return x !== x && y !== y;
    }
}

function shallowEqual(objA, objB) {
    if (is(objA, objB)) return true;

    if ((typeof objA === 'undefined' ? 'undefined' : (0, _typeof3.default)(objA)) !== 'object' || objA === null || (typeof objB === 'undefined' ? 'undefined' : (0, _typeof3.default)(objB)) !== 'object' || objB === null) {
        return false;
    }

    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    for (var i = 0; i < keysA.length; i++) {
        var key = keysA[i];

        if (!hasOwn.call(objB, key) || !is(objA[key], objB[key])) {
            return false;
        }
    }

    return true;
}
module.exports = exports['default'];