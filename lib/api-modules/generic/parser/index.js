'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parseApiResponse = undefined;

var _humps = require('humps');

// The default api module doesn't normalize the data, it simply attaches it to the ref
var parseApiResponse = exports.parseApiResponse = function parseApiResponse(response) {
    return {
        entryRef: (0, _humps.camelizeKeys)(response)
    };
};

exports.default = parseApiResponse;