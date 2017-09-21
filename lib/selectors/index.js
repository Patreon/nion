'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.selectData = exports.selectResource = exports.selectResourceForKey = exports.selectResourcesForKeys = exports.selectObjectWithRequest = exports.selectRequest = exports.selectObject = exports.selectEntityFromKey = exports.selectEntity = exports.selectRef = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _reselect = require('reselect');

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.omit');

var _lodash4 = _interopRequireDefault(_lodash3);

var _denormalize = require('../denormalize');

var _denormalize2 = _interopRequireDefault(_denormalize);

var _withCache = require('../denormalize/with-cache');

var _withCache2 = _interopRequireDefault(_withCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var selectNion = function selectNion(state) {
    return state.nion;
};
var selectEntities = function selectEntities(state) {
    return (0, _lodash2.default)(selectNion(state), 'entities');
};
var selectRequests = function selectRequests(state) {
    return (0, _lodash2.default)(selectNion(state), 'requests');
};
var selectReferences = function selectReferences(state) {
    return (0, _lodash2.default)(selectNion(state), 'references');
};

var makeDefaultRequest = function makeDefaultRequest() {
    return {
        status: 'not called'
    };
};

var isGeneric = function isGeneric(ref) {
    // This may not be the best way to check if something is a ref to entities or not
    return (0, _lodash2.default)(ref, 'entities') === undefined;
};

var selectRef = exports.selectRef = function selectRef(dataKey) {
    return (0, _reselect.createSelector)(selectReferences, function (refs) {
        return (0, _lodash2.default)(refs, dataKey);
    });
};

var selectEntity = exports.selectEntity = function selectEntity(type, id) {
    return (0, _reselect.createSelector)(selectEntities, function (entities) {
        return (0, _lodash2.default)(entities, [type, id]);
    });
};

var selectEntityFromKey = exports.selectEntityFromKey = function selectEntityFromKey(key) {
    return (0, _reselect.createSelector)(selectRef(key), selectEntities, function (ref, entityStore) {
        var isCollection = ref.isCollection;

        var entities = ref.entities.map(function (entity) {
            return (0, _lodash2.default)(entityStore, [entity.type, entity.id]);
        });
        return isCollection ? entities : entities[0];
    });
};

var selectObject = exports.selectObject = function selectObject(dataKey) {
    return (0, _reselect.createSelector)(selectRef(dataKey), selectEntities, function (ref, entityStore) {
        // If the ref is a generic (eg a primitive from a non-json-api response), return the ref
        if (isGeneric(ref)) {
            return ref;
        }

        var isCollection = ref.isCollection;

        var denormalized = (0, _withCache2.default)(ref, entityStore, dataKey);

        return isCollection ? denormalized : denormalized[0];
    });
};

var selectExtraRefProps = function selectExtraRefProps(dataKey) {
    return (0, _reselect.createSelector)(selectRef(dataKey), function (ref) {
        return (0, _extends3.default)({}, (0, _lodash4.default)(ref, ['entities', 'isCollection']));
    });
};

var selectRequest = exports.selectRequest = function selectRequest(key) {
    return (0, _reselect.createSelector)(selectRequests, function (apiRequests) {
        var request = (0, _lodash2.default)(apiRequests, key, makeDefaultRequest());
        return (0, _extends3.default)({}, request);
    });
};

// Selects the denormalized object plus all relevant request data from the store
var selectObjectWithRequest = exports.selectObjectWithRequest = function selectObjectWithRequest(dataKey) {
    return (0, _reselect.createSelector)(selectObject(dataKey), selectRequest(dataKey), selectExtraRefProps(dataKey), function (obj, request, extra) {
        return (0, _extends3.default)({
            obj: obj,
            request: request
        }, extra);
    });
};

// Selects a keyed map of { obj, request } resources from the store taking an array of dataKeys
var selectResourcesForKeys = exports.selectResourcesForKeys = function selectResourcesForKeys(dataKeys) {
    return function (state) {
        return dataKeys.reduce(function (memo, key) {
            memo[key] = selectObjectWithRequest(key)(state);
            return memo;
        }, {});
    };
};

// Selects the combination { obj, request } resource from the store taking a dataKey
var selectResourceForKey = exports.selectResourceForKey = function selectResourceForKey(dataKey) {
    return function (state) {
        return selectObjectWithRequest(dataKey)(state);
    };
};

// Selects the combination { obj, request } resource from the store, taking either a dataKey or
// array of dataKeys
var selectResource = exports.selectResource = function selectResource(keyOrKeys) {
    if (keyOrKeys instanceof Array) {
        return selectResourcesForKeys(keyOrKeys);
    } else {
        return selectResourceForKey(keyOrKeys);
    }
};

// Use the _.get syntax to pass in an address string (ie <dataKey>.<attributeName>), and default
// value. If the provided argument is an object with the signature { type, id }, then select and
// denormalize the corresponding entity
var selectData = exports.selectData = function selectData(key, defaultValue) {
    // If we pass in an object of { type, id } signature, denormalize the corresponding entity
    if ((typeof key === 'undefined' ? 'undefined' : (0, _typeof3.default)(key)) === 'object' && key.type && key.id !== undefined) {
        var entityRef = key;
        return (0, _reselect.createSelector)(selectEntities, function (entityStore) {
            return (0, _denormalize2.default)(entityRef, entityStore);
        });
    }

    // Otherwise, use the _.get syntax to select the data
    var splitKeys = key instanceof Array ? key : key.replace(']', '').split(/[.|[]/g);
    var dataKey = splitKeys[0];
    return (0, _reselect.createSelector)(selectObject(dataKey), function (obj) {
        if (splitKeys.length === 1) {
            return obj === undefined ? defaultValue : obj;
        } else {
            return (0, _lodash2.default)(obj, splitKeys.slice(1, splitKeys.length), defaultValue);
        }
    });
};