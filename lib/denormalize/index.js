'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasEntityReference = exports.getEntityReference = exports.addEntityReference = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

exports.default = denormalizeWithCache;

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.map');

var _lodash4 = _interopRequireDefault(_lodash3);

var _humps = require('humps');

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function denormalizeWithCache(reference, entityStore, dataKey) {
    var refs = reference.entities;
    return refs.map(function (ref) {
        var _denormalize = denormalize(ref, entityStore),
            denormalized = _denormalize.denormalized;

        return denormalized;
    });
}

var Data = function Data(type, id, attributes) {
    var _this = this;

    (0, _classCallCheck3.default)(this, Data);

    this.type = type;
    this.id = id;
    (0, _lodash4.default)(attributes, function (value, key) {
        _this[key] = value;
    });
};

Data.prototype._exists = true;

var addEntityReference = exports.addEntityReference = function addEntityReference(obj, value) {
    return obj.set('_ref', value);
};

var getEntityReference = exports.getEntityReference = function getEntityReference(obj) {
    return (0, _lodash2.default)(obj, '_ref');
};

var hasEntityReference = exports.hasEntityReference = function hasEntityReference(obj) {
    return Boolean(getEntityReference(obj));
};

// In order to optimize nion render performance, we want to both a) create immutable denormalized
// objects (for simple equality comparison in our shouldUpdate / shouldRender logic) and b) cache
// those denormalized objects to help reduce calls to the (somewhat) expensive denormalization step.
// We achieve this by using a denormalization cache to do the following:
//
// - Each ref ({ type, id }) tuple will have a corresponding manifest of related refs ({ id, type })
//   stored in the cache. This manifest includes a ref to every entity that composes the fully
//   denormalized object, and we construct this list as we recursively denormalize an entity
// - For each entity we denormalize, we keep a reference to the immutable entity object from the
//   store. This will make it easy to compare the cached entity with the current entity in the
//   passed in redux entityStore.
// - This lets us easily check whether any of the entities that are related to a given entity
//   (those that comprise the denormalized object) have changed by simple equality check of the
//   cached vs incoming redux store entities.
// - If the related entities have changed, we re-denormalize the object and store it, its entities,
//   and its related refs in the cache
// - If not, we simply fetch the already denormalized object from the cache
//
// Since all denormalized objects in the cache are immutable, we can very easily compare them
// in downstream selectors, redux connect functions, or componentShouldUpdate methods to optimize
// re-render performance
function denormalize(ref, entityStore) {
    var existingObjects = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!(ref && ref.type && ref.id)) {
        return { denormalized: undefined };
    }

    var type = ref.type,
        id = ref.id;

    var manifest = _cache2.default.initializeManifest(ref);

    // Check to see if the underlying data has changed for the ref, if not - we'll return the
    // cached immutable denormalized version, otherwise we'll construct a new denormalized portion
    // and update the related refs that are part of this ref's dependency tree
    var hasDataChanged = _cache2.default.hasDataChanged(ref, entityStore);

    if (!hasDataChanged) {
        var denormalized = _cache2.default.getDenormalized(type, id);
        return { denormalized: denormalized, related: manifest };
    }

    // Check the existing object to see if a reference to the denormalized object already exists,
    // if so, use the existing denormalized object
    var existingObject = (0, _lodash2.default)(existingObjects, [type, id]);
    if (existingObject) {
        return {
            denormalized: existingObject,
            related: manifest
        };
    }

    // Otherwise, fetch the entity from the entity store
    var entity = (0, _lodash2.default)(entityStore, [type, id]);
    if (entity === undefined) {
        return { denormalized: undefined };
    }

    // Construct the new base denormalized object and add it to the existing denormalized cache
    var attributes = (0, _humps.camelizeKeys)(entity.attributes);
    var data = new Data(type, id, attributes);
    var obj = (0, _seamlessImmutable2.default)(data, {
        prototype: Data.prototype
    });

    existingObjects[type] = existingObjects[type] || {};
    existingObjects[type][id] = obj;

    // Now map over the relationships, accruing a list of related refs that we check for changes
    // against
    var relationships = (0, _lodash2.default)(entity, 'relationships', {});

    (0, _lodash4.default)(relationships, function (relationship, key) {
        var refOrRefs = relationship.data; // The { id, type } pointers stored on 'data' key
        var camelizedKey = (0, _humps.camelize)(key);

        // Define the next denormalized object or array of denormalized objects that we will set
        // on the specific key. We'll also need to add a _ref property to this object so we can
        // track the original information about the data
        var toSet = void 0;

        if (refOrRefs === null) {
            obj = obj.set(camelizedKey, null);
            return;
        } else if (!Array.isArray(refOrRefs)) {
            var _denormalize2 = denormalize(refOrRefs, entityStore, existingObjects),
                _denormalized = _denormalize2.denormalized,
                related = _denormalize2.related;

            toSet = _denormalized;
            manifest = (0, _extends3.default)({}, manifest, related);
        } else {
            toSet = refOrRefs.map(function (_ref) {
                var _denormalize3 = denormalize(_ref, entityStore, existingObjects),
                    denormalized = _denormalize3.denormalized,
                    related = _denormalize3.related;

                manifest = (0, _extends3.default)({}, manifest, related);
                return denormalized;
            });
        }

        // Establish a "_ref" property on the object, that acts as a pointer to the original
        // relationship
        if (!hasEntityReference(toSet)) {
            toSet = addEntityReference(toSet, relationship);
        }
        obj = obj.set(camelizedKey, toSet);
    });

    // Establish a "_ref" property on the object, that acts as a pointer to the original entity
    if (!hasEntityReference(obj)) {
        obj = addEntityReference(obj, { data: { id: id, type: type } });
    }

    _cache2.default.addEntity(entity);
    _cache2.default.addManifest(entity, manifest);
    _cache2.default.addDenormalized(type, id, obj);

    return { denormalized: obj, related: manifest };
}