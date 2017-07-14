'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parseApiResponse = undefined;

var _humps = require('humps');

var parseApiResponse = exports.parseApiResponse = function parseApiResponse(response) {
    return {
        entryRef: (0, _humps.camelizeKeys)(response)
    };
};

exports.default = parseApiResponse;