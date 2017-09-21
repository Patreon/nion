'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var makeKey = function makeKey(type, id) {
    return type + ':' + id;
};

var EntityCache = function EntityCache() {
    var _this = this;

    (0, _classCallCheck3.default)(this, EntityCache);
    this.denormalized = {};
    this.related = {};
    this.entities = {};

    this.addDenormalized = function (type, id, data) {
        var key = makeKey(type, id);
        _this.denormalized[key] = data;
    };

    this.addEntity = function (entity) {
        var entityKey = makeKey(entity.type, entity.id);
        _this.entities[entityKey] = entity;
    };

    this.addRelated = function (entity, relatedRefs) {
        var entityKey = makeKey(entity.type, entity.id);
        _this.related[entityKey] = _this.related[entityKey] || {};

        (0, _lodash4.default)(relatedRefs, function (relatedRef) {
            var relationshipKey = makeKey(relatedRef.type, relatedRef.id);
            _this.relationships[entityKey][relationshipKey] = relatedRef;
        });
    };

    this.getEntity = function (type, id) {
        var key = makeKey(type, id);
        return _this.entities[key];
    };

    this.getRelated = function (type, id) {
        var key = makeKey(type, id);
        return _this.related[key];
    };

    this.getDenormalized = function (type, id) {
        var key = makeKey(type, id);
        return _this.denormalized[key];
    };

    this.hasDataChanged = function (ref, entityStore) {
        var related = _this.getRelated(ref.type, ref.id) || {};
        var toCheck = [ref].concat(Object.values(related));
        return toCheck.reduce(function (memo, _ref2) {
            var type = _ref2.type,
                id = _ref2.id;

            var hasChanged = _this.getEntity(type, id) !== (0, _lodash2.default)(entityStore, [type, id]);
            return hasChanged || memo;
        }, false);
    };
};

var entityCache = new EntityCache();

window.entityCache = entityCache;

function denormalizeWithCache(reference, entityStore, dataKey) {
    var refs = reference.entities;
    return refs.map(function (ref) {
        var _denormalize = denormalize(ref, entityStore),
            denormalized = _denormalize.denormalized;

        return denormalized;
    });
}

function denormalize(ref, entityStore) {
    var existingObjects = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!(ref && ref.type && ref.id)) {
        return undefined;
    }

    var type = ref.type,
        id = ref.id;

    var relatedRefs = {};

    // Check to see if the underlying data has changed for the ref, if not - we'll return the
    // cached immutable denormalized version, otherwise we'll construct a new denormalized portion
    // and update the related refs that are part of this ref's dependency tree
    var hasDataChanged = entityCache.hasDataChanged(ref, entityStore);
    if (!hasDataChanged) {
        var denormalized = entityCache.getDenormalized(ref.type, ref.id);
        return { denormalized: denormalized, relatedRefs: relatedRefs };
    }

    // Check the existing object to see if a reference to the denormalized object already exists,
    // if so, use the existing denormalized object
    var existingObject = (0, _lodash2.default)(existingObjects, [type, id]);
    if (existingObject) {
        return {
            denormalized: existingObject,
            relatedRefs: relatedRefs
        };
    }

    // Otherwise, fetch the entity from the entity store
    var entity = (0, _lodash2.default)(entityStore, [type, id]);
    if (entity === undefined) {
        return undefined;
    }

    // Construct the new base denormalized object and add it to the existing denormalized cache
    var obj = (0, _seamlessImmutable2.default)((0, _extends3.default)({
        id: id,
        type: type
    }, (0, _humps.camelizeKeys)(entity.attributes)));

    existingObjects[type] = existingObjects[type] || {};
    existingObjects[type][id] = obj;

    // Now map over the relationships, accruing a list of related refs that we check for changes
    // against
    var relationships = (0, _lodash2.default)(entity, 'relationships', {});
    (0, _lodash4.default)(relationships, function (relationship, key) {
        var refOrRefs = relationship.data; // The { id, type } pointers stored on 'data' key
        var camelizedKey = (0, _humps.camelize)(key);

        if (refOrRefs === null) {
            obj = obj.set(camelizedKey, null);
            return;
        } else if (!Array.isArray(refOrRefs)) {
            var _denormalize2 = denormalize(refOrRefs, entityStore, existingObjects),
                _denormalized = _denormalize2.denormalized,
                related = _denormalize2.related;

            obj = obj.set(camelizedKey, _denormalized);
            relatedRefs = (0, _extends3.default)({}, relatedRefs, related);
        } else {
            obj = obj.set(camelizedKey, refOrRefs.map(function (_ref) {
                var _denormalize3 = denormalize(_ref, entityStore, existingObjects),
                    denormalized = _denormalize3.denormalized,
                    related = _denormalize3.related;

                relatedRefs = (0, _extends3.default)({}, relatedRefs, related);
                return denormalized;
            }));
        }
    });

    // Establish a "_ref" property on the object, that acts as a pointer to the original entity
    if (!obj._ref) {
        obj = obj.set('_ref', { value: { data: { id: id, type: type } } });
    }

    entityCache.addEntity(entity);
    entityCache.addRelated(entity, relatedRefs);
    entityCache.addDenormalized(type, id, obj);

    return { denormalized: obj, related: relatedRefs };
}
module.exports = exports['default'];