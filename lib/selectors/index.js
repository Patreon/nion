'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.selectData = exports.selectResource = exports.selectResourceForKey = exports.selectResourcesForKeys = exports.selectObjectWithRequest = exports.selectRequest = exports.selectObject = exports.selectEntityFromKey = exports.selectEntity = exports.selectRef = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

var _reselect = require('reselect');

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.omit');

var _lodash4 = _interopRequireDefault(_lodash3);

var _denormalize = require('../denormalize');

var _denormalize2 = _interopRequireDefault(_denormalize);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var selectNion = function selectNion(state) {
    return state.nion;
};
var selectEntities = (0, _reselect.createSelector)(selectNion, function (nion) {
    return (0, _lodash2.default)(nion, 'entities');
});
var selectRequests = (0, _reselect.createSelector)(selectNion, function (nion) {
    return (0, _lodash2.default)(nion, 'requests');
});
var selectReferences = (0, _reselect.createSelector)(selectNion, function (nion) {
    return (0, _lodash2.default)(nion, 'references');
});

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

        // JB (in ref to the comment above)
        // We know the API type, we should be storing this information with the payload
        // this will simplify our assumptions
        if (isGeneric(ref)) {
            return (0, _denormalize.getGenericRefData)(ref);
        }

        var isCollection = ref.isCollection;

        var denormalized = (0, _denormalize2.default)(ref, entityStore);

        return isCollection ? denormalized : denormalized[0];
    });
};

var selectExtraRefProps = function selectExtraRefProps(dataKey) {
    return (0, _reselect.createSelector)(selectRef(dataKey), function (ref) {
        return (0, _extends3.default)({}, (0, _lodash4.default)(ref, ['entities', 'isCollection']));
    });
};

// We need to make a simple singleton default immutable request so that areRequestsEqual comparisons
// are super simple and straightforward in the areMergedPropsEqual comparison function
// TODO: We might want to refactor this so that each request dataKey in the requests reducer is
// initialized with this immutable state
var defaultRequest = (0, _seamlessImmutable2.default)({
    status: _constants.ActionStatus.NOT_CALLED
});

var selectRequest = exports.selectRequest = function selectRequest(key) {
    return (0, _reselect.createSelector)(selectRequests, function (apiRequests) {
        var request = (0, _lodash2.default)(apiRequests, key, defaultRequest);
        return request;
    });
};

// Selects the denormalized object plus all relevant request data from the store
var selectObjectWithRequest = exports.selectObjectWithRequest = function selectObjectWithRequest(dataKey) {
    return (0, _reselect.createSelector)(selectObject(dataKey), selectRequest(dataKey), selectExtraRefProps(dataKey), function (obj, request, extra) {
        return {
            obj: obj,
            request: request,
            extra: extra
        };
    });
};

// Selects a keyed map of { obj, request } resources from the store taking an array of dataKeys
var selectResourcesForKeys = exports.selectResourcesForKeys = function selectResourcesForKeys(dataKeys) {
    var returnAllObjects = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    return function (state) {
        return dataKeys.reduce(function (memo, key) {
            memo[key] = selectObjectWithRequest(key, returnAllObjects)(state);
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
        var entityRef = {
            entities: [{ type: key.type, id: key.id }]
        };

        return (0, _reselect.createSelector)(selectEntities, function (entityStore) {
            return (0, _denormalize2.default)(entityRef, entityStore)[0];
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