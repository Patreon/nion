"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = clone;
// Yes, a bit funny - but it turns out this is a safe, fast, and terse way of deep cloning data
function clone(input) {
    return JSON.parse(JSON.stringify(input));
}
module.exports = exports["default"];