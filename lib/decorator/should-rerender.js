'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
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

function getDataPropertyKeys(obj) {
    var enumerableKeys = Object.keys(obj);
    var allKeys = Object.getOwnPropertyNames(obj);
    return (0, _lodash2.default)(allKeys, enumerableKeys);
}

var keysWithCustomComparators = ['actions', 'request', 'extra'];
function compareCustomProperties(prevResource, nextResource) {
    var prevDataKeys = getDataPropertyKeys(prevResource);
    var nextDataKeys = getDataPropertyKeys(nextResource);
    var prevExtraProps = (0, _lodash2.default)(prevDataKeys, keysWithCustomComparators);
    var nextExtraProps = (0, _lodash2.default)(nextDataKeys, keysWithCustomComparators);
    if (prevExtraProps.length !== nextExtraProps.length) {
        return false;
    }
    return (0, _lodash4.default)(nextExtraProps, function (extraPropKey) {
        return (0, _deepEqual2.default)((0, _lodash6.default)(prevResource, extraPropKey), (0, _lodash6.default)(nextResource, extraPropKey));
    });
}

// We don't want to do a strict immutable check here because we're adding a 'canLoadMore' property
// to the selected request in the nion decorator...
// TODO: we'll probably want to handle that special pagination property a bit more elegantly /
// consistently so that it's automatically added to the request reducer

function compareRequests(prevRequests, nextRequests) {
    return (0, _lodash6.default)(prevRequests, 'status') === (0, _lodash6.default)(nextRequests, 'status') && (0, _lodash6.default)(prevRequests, 'fetchedAt') === (0, _lodash6.default)(nextRequests, 'fetchedAt');
}

function compareObject(prevObject, nextObject) {
    // If the selected data do not exist yet, the ad-hoc created nonexistence objects should be
    // treated as equal
    if (!(0, _index.exists)(prevObject) && !(0, _index.exists)(nextObject)) {
        return true;
    } else {
        return prevObject === nextObject;
    }
}

// TODO: We can probably make this situation a bit more elegant - right now, we're forced to compare
// each element of an array containing denormalized objects to see if any of them have changed...
// it's probably more straightforward to compare immutable arrays. In addition, this would make
// it easier to handle the subtle weirdness around non-existent objects, which we'll probably want
// to change up how we handle as we transition towards injecting data under the "data" named prop
function compareData(prevData, nextData) {
    // Cast all input data to an array to make comparisons between non-existent and existent
    // collections more straightforward
    prevData = prevData instanceof Array ? prevData : [prevData];
    nextData = nextData instanceof Array ? nextData : [nextData];

    if (prevData.length !== nextData.length) {
        return false;
    }

    for (var i = 0; i < prevData.length; i++) {
        var areEqual = compareObject(prevData[i], nextData[i]);
        if (!areEqual) {
            return false;
        }
    }
    return true;
}

function comparePassedProps(nextProps, props) {
    return (0, _shallowEqual2.default)((0, _lodash8.default)(nextProps, 'nion'), (0, _lodash8.default)(props, 'nion'));
}

function areMergedPropsEqual(nextProps, props) {
    var keysToIgnore = ['_initializeDataKey', 'updateEntity', '_declarations'];
    var prevNionKeys = (0, _lodash2.default)(Object.keys(props.nion), keysToIgnore);
    var nextNionKeys = (0, _lodash2.default)(Object.keys(nextProps.nion), keysToIgnore);
    if (prevNionKeys.length !== nextNionKeys.length) {
        return false;
    }
    if (!(0, _deepEqual2.default)(prevNionKeys, nextNionKeys)) {
        return false;
    }

    // Check the custom props being passed in from parent components
    var passedPropsAreEqual = comparePassedProps(nextProps, props);
    if (!passedPropsAreEqual) {
        return false;
    }

    return (0, _lodash4.default)(nextNionKeys, function (propKey) {
        // Compare this particular nion dataProp's actions, denormalized objects, and request state
        var prevResource = props.nion[propKey];
        var nextResource = nextProps.nion[propKey];

        // Compare all extra properties, except those which have custom comparators
        var customPropsAreEqual = compareCustomProperties(prevResource, nextResource);

        if (!customPropsAreEqual) {
            return false;
        }

        // Compare request state
        var requestsAreEqual = compareRequests(prevResource.request, nextResource.request);

        if (!requestsAreEqual) {
            return false;
        }

        // Compare selected denormalized data
        var dataAreEqual = compareData(prevResource.data, nextResource.data);
        return dataAreEqual;
    });
}