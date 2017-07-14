'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parseJsonApiResponse = exports.isJsonApiResponse = undefined;

var _lodash = require('lodash.map');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.every');

var _lodash4 = _interopRequireDefault(_lodash3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var addEntityToStoreFragment = function addEntityToStoreFragment(store) {
    var entity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var type = entity.type,
        id = entity.id,
        attributes = entity.attributes,
        relationships = entity.relationships;

    if (!entity) {
        return;
    }
    if (!(type in store)) {
        store[type] = {};
    }
    store[type][id] = {
        type: type,
        id: id,
        attributes: attributes,
        relationships: relationships
    };
};

var normalizeDataEntities = function normalizeDataEntities(storeFragment, dataEntities) {
    var entityList = Array.isArray(dataEntities) ? dataEntities : [dataEntities];
    entityList.map(function (entity) {
        return addEntityToStoreFragment(storeFragment, entity);
    });
};

var normalizeIncludedEntities = function normalizeIncludedEntities(storeFragment, includedEntities) {
    (0, _lodash2.default)(includedEntities, function (entity) {
        return addEntityToStoreFragment(storeFragment, entity);
    });
};

var makeEntityReferences = function makeEntityReferences(data) {
    if (!data) {
        return [];
    }
    var dataList = Array.isArray(data) ? data : [data];
    return dataList.map(function (entity) {
        return { id: entity.id, type: entity.type };
    });
};

var isJsonApiResponse = exports.isJsonApiResponse = function isJsonApiResponse(_ref) {
    var data = _ref.data;

    var dataList = Array.isArray(data) ? data : [data];
    return data && (0, _lodash4.default)(dataList, function (ref) {
        return ref.id !== undefined && ref.type !== undefined;
    });
};

var parseJsonApiResponse = exports.parseJsonApiResponse = function parseJsonApiResponse() {
    var response = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var data = response.data,
        included = response.included,
        meta = response.meta,
        links = response.links;

    // Create the new ref to pass to the entities reducer.

    var entryRef = {
        entities: makeEntityReferences(data),
        meta: meta,
        links: links,
        isCollection: data instanceof Array

        // Create a store fragment map of normalized entities to pass to the entity reducer
        // This will take the shape of { [type] : { [id]: ... } }
    };var storeFragment = {};
    normalizeDataEntities(storeFragment, data);
    normalizeIncludedEntities(storeFragment, included);

    return {
        storeFragment: storeFragment,
        entryRef: entryRef
    };
};

exports.default = parseJsonApiResponse;