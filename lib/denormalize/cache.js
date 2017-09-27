'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.makeKey = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.map');

var _lodash4 = _interopRequireDefault(_lodash3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var makeKey = exports.makeKey = function makeKey(type, id) {
    return type + ':' + id;
};

var DenormalizationCache = function DenormalizationCache() {
    var _this = this;

    (0, _classCallCheck3.default)(this, DenormalizationCache);
    this.denormalized = {};
    this.manifests = {};
    this.entities = {};

    this.initializeManifest = function (ref) {
        var type = ref.type,
            id = ref.id;

        var key = makeKey(type, id);
        return (0, _defineProperty3.default)({}, key, ref);
    };

    this.addDenormalized = function (type, id, data) {
        var key = makeKey(type, id);
        _this.denormalized[key] = data;
    };

    this.addEntity = function (entity) {
        var entityKey = makeKey(entity.type, entity.id);
        _this.entities[entityKey] = entity;
    };

    this.addManifest = function (entity, manifest) {
        var entityKey = makeKey(entity.type, entity.id);
        _this.manifests[entityKey] = _this.manifests[entityKey] || {};

        (0, _lodash4.default)(manifest, function (relatedRef) {
            var relationshipKey = makeKey(relatedRef.type, relatedRef.id);
            _this.manifests[entityKey][relationshipKey] = relatedRef;
        });
    };

    this.getEntity = function (type, id) {
        var key = makeKey(type, id);
        return _this.entities[key];
    };

    this.getManifest = function (type, id) {
        var key = makeKey(type, id);
        return _this.manifests[key];
    };

    this.getDenormalized = function (type, id) {
        var key = makeKey(type, id);
        return _this.denormalized[key];
    };

    this.hasDataChanged = function (ref, entityStore) {
        var manifest = _this.getManifest(ref.type, ref.id) || {};
        var toCheck = [ref].concat(Object.values(manifest));

        var changed = toCheck.reduce(function (memo, _ref2) {
            var type = _ref2.type,
                id = _ref2.id;

            var hasChanged = _this.getEntity(type, id) !== (0, _lodash2.default)(entityStore, [type, id]);
            return hasChanged || memo;
        }, false);

        return changed;
    };
};

var denormalizationCache = new DenormalizationCache();
exports.default = denormalizationCache;