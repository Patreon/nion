'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.map');

var _lodash4 = _interopRequireDefault(_lodash3);

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
        return toCheck.reduce(function (memo, _ref) {
            var type = _ref.type,
                id = _ref.id;

            var hasChanged = _this.getEntity(type, id) !== (0, _lodash2.default)(entityStore, [type, id]);
            return hasChanged || memo;
        }, false);
    };
};

var entityCache = new EntityCache();
exports.default = entityCache;
module.exports = exports['default'];