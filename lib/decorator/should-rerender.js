'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.requestsAreEqual = requestsAreEqual;
exports.extrasAreEqual = extrasAreEqual;
exports.extensionsAreEqual = extensionsAreEqual;
exports.dataAreEqual = dataAreEqual;
exports.passedPropsAreEqual = passedPropsAreEqual;
exports.areMergedPropsEqual = areMergedPropsEqual;

var _lodash = require('lodash.difference');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.every');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.get');

var _lodash6 = _interopRequireDefault(_lodash5);

var _lodash7 = require('lodash.omit');

var _lodash8 = _interopRequireDefault(_lodash7);

var _deepEqual = require('deep-equal');

var _deepEqual2 = _interopRequireDefault(_deepEqual);

var _shallowEqual = require('../utilities/shallow-equal');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function requestsAreEqual(prevRequests, nextRequests) {
    return (0, _lodash6.default)(prevRequests, 'status') === (0, _lodash6.default)(nextRequests, 'status') && (0, _lodash6.default)(prevRequests, 'fetchedAt') === (0, _lodash6.default)(nextRequests, 'fetchedAt');
}

function extrasAreEqual(prevExtra, nextExtra) {
    if (!(prevExtra && nextExtra)) {
        return true;
    }

    var prevExtraKeys = Object.keys(prevExtra) || [];
    var nextExtraKeys = Object.keys(nextExtra) || [];

    if (prevExtraKeys.length !== nextExtraKeys.length) {
        return false;
    }

    return (0, _shallowEqual2.default)(prevExtra, nextExtra);
}

function extensionsAreEqual(prevExts, nextExts) {
    if (!(prevExts && nextExts)) {
        return true;
    }

    var prevExtensionKeys = Object.keys(prevExts) || [];
    var nextExtensionKeys = Object.keys(nextExts) || [];

    if (!(0, _deepEqual2.default)(prevExtensionKeys, nextExtensionKeys)) {
        return false;
    }

    return (0, _lodash4.default)(nextExtensionKeys, function (key) {
        return (0, _deepEqual2.default)((0, _lodash6.default)(prevExts, [key, 'meta']), (0, _lodash6.default)(nextExts, [key, 'meta']));
    });
}

function dataAreEqual(prevData, nextData) {
    var safeKeys = function safeKeys(object) {
        return (typeof object === 'undefined' ? 'undefined' : (0, _typeof3.default)(object)) === 'object' ? Object.keys(object) : [];
    };

    var prevKeys = safeKeys(prevData);
    var nextKeys = safeKeys(nextData);

    if (prevKeys.length !== nextKeys.length) {
        return false;
    }

    return (0, _lodash4.default)(prevKeys, function (key) {
        if (!(0, _index.exists)(prevData[key]) && !(0, _index.exists)(nextData[key])) {
            return true;
        }

        return prevData[key] === nextData[key];
    });
}

function passedPropsAreEqual(nextProps, props) {
    return (0, _shallowEqual2.default)((0, _lodash8.default)(nextProps, 'nion'), (0, _lodash8.default)(props, 'nion'));
}

function areMergedPropsEqual(nextProps, props) {
    var keysToIgnore = ['_initializeDataKey', 'updateEntity', '_declarations'];
    var prevNionKeys = (0, _lodash2.default)(Object.keys(props.nion), keysToIgnore);
    var nextNionKeys = (0, _lodash2.default)(Object.keys(nextProps.nion), keysToIgnore);
    if (prevNionKeys.length !== nextNionKeys.length) {
        return false;
    }
    if (!(0, _shallowEqual2.default)(prevNionKeys, nextNionKeys)) {
        return false;
    }

    // Check the custom props being passed in from parent components
    if (!passedPropsAreEqual(nextProps, props)) {
        return false;
    }

    return (0, _lodash4.default)(nextNionKeys, function (propKey) {
        // Compare this particular nion dataProp's actions, denormalized objects, and request state
        var prevResource = props.nion[propKey];
        var nextResource = nextProps.nion[propKey];

        // Compare request state
        if (!requestsAreEqual(prevResource.request, nextResource.request)) {
            return false;
        }

        if (!extrasAreEqual(prevResource.extra, nextResource.extra)) {
            return false;
        }

        // Compare extensions
        if (!extensionsAreEqual(prevResource.extensions, nextResource.extensions)) {
            return false;
        }

        // Compare selected denormalized data
        return dataAreEqual(prevResource.data, nextResource.data);
    });
}