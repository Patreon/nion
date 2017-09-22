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

var _isEqualShallow = require('is-equal-shallow');

var _isEqualShallow2 = _interopRequireDefault(_isEqualShallow);

var _deepEqual = require('deep-equal');

var _deepEqual2 = _interopRequireDefault(_deepEqual);

var _denormalize = require('../denormalize');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function areNonNionDataEqual(props, nextProps) {
    var prevNonNionData = (0, _lodash8.default)(props, ['nion']);
    var nextNonNionData = (0, _lodash8.default)(nextProps, ['nion']);
    return (0, _isEqualShallow2.default)(prevNonNionData, nextNonNionData);
}

function getDataPropertyKeys(obj) {
    var enumerableKeys = Object.keys(obj);
    var allKeys = Object.getOwnPropertyNames(obj);
    return (0, _lodash2.default)(allKeys, enumerableKeys);
}

var keysWithCustomComparators = ['actions', 'request', 'allObjects'];
function areCustomDataEqual(prevResource, nextResource) {
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

function areRequestsEqual(prevRequests, nextRequests) {
    return (0, _lodash6.default)(prevRequests, 'status') === (0, _lodash6.default)(nextRequests, 'status') && (0, _lodash6.default)(prevRequests, 'fetchedAt') === (0, _lodash6.default)(nextRequests, 'fetchedAt');
}

function flattenEntities(entitiesTree) {
    if (!entitiesTree) {
        return [];
    }
    var result = [];
    var entityTypes = Object.keys(entitiesTree).sort();
    entityTypes.forEach(function (entityType) {
        var entitiesById = entitiesTree[entityType];
        var ids = Object.keys(entitiesById).sort();
        ids.forEach(function (entityId) {
            result.push(entitiesById[entityId]);
        });
    });
    return result;
}

function areEntitiesEqual(prevEntity, nextEntity) {
    var prevEntityKeys = Object.keys(prevEntity).sort();
    var nextEntityKeys = Object.keys(nextEntity).sort();
    if (prevEntityKeys.length !== nextEntityKeys.length) {
        return false;
    }

    return (0, _lodash4.default)(nextEntityKeys, function (entityKey) {
        var prevValue = prevEntity[entityKey];
        var nextValue = nextEntity[entityKey];
        if ((0, _denormalize.hasEntityReference)(nextValue)) {
            return true;
        }
        return (0, _deepEqual2.default)(prevValue, nextValue);
    });
}

function areEntityListsEqual(prevFlatEntities, nextFlatEntities) {
    if (prevFlatEntities.length !== nextFlatEntities.length) {
        return false;
    }

    for (var index = 0; index < nextFlatEntities.length; index++) {
        var prevEntity = prevFlatEntities[index];
        var nextEntity = nextFlatEntities[index];
        if (!areEntitiesEqual(prevEntity, nextEntity)) {
            return false;
        }
    }

    return true;
}

function areMergedPropsEqual(nextProps, props) {
    if (!areNonNionDataEqual(props, nextProps)) {
        return false;
    }

    var keysToIgnore = ['_initializeDataKey', 'updateEntity', '_declarations'];
    var prevNionKeys = (0, _lodash2.default)(Object.keys(props.nion), keysToIgnore);
    var nextNionKeys = (0, _lodash2.default)(Object.keys(nextProps.nion), keysToIgnore);
    if (prevNionKeys.length !== nextNionKeys.length) {
        return false;
    }
    if (!(0, _deepEqual2.default)(prevNionKeys, nextNionKeys)) {
        return false;
    }
    return (0, _lodash4.default)(nextNionKeys, function (propKey) {
        // Compare this particular nion's object and request state
        var prevResource = props.nion[propKey];
        var nextResource = nextProps.nion[propKey];

        // Compare all extra properties, except those which have custom comparators
        var customDataEqualityResult = areCustomDataEqual(prevResource, nextResource);
        if (!customDataEqualityResult) {
            return false;
        }

        // Compare request state
        var requestsEqualityResult = areRequestsEqual((0, _lodash6.default)(prevResource, 'request'), (0, _lodash6.default)(nextResource, 'request'));
        if (!requestsEqualityResult) {
            return false;
        }

        // Compare entity data
        var prevFlatEntities = flattenEntities((0, _lodash6.default)(prevResource, 'allObjects'));
        var nextFlatEntities = flattenEntities((0, _lodash6.default)(nextResource, 'allObjects'));
        return areEntityListsEqual(prevFlatEntities, nextFlatEntities);
    });
}