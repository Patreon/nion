'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.default = denormalize;

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.set');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.map');

var _lodash6 = _interopRequireDefault(_lodash5);

var _lodash7 = require('lodash.merge');

var _lodash8 = _interopRequireDefault(_lodash7);

var _humps = require('humps');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function denormalize(ref, entities) {
    var existingObjects = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!(ref && ref.type && ref.id)) {
        return undefined;
    }

    var type = ref.type,
        id = ref.id;

    // Check the existing object to see if a reference to the denormalized object already exists,
    // if so, use the existing denormalized object

    var existingObject = (0, _lodash2.default)(existingObjects, [type, id]);
    if (existingObject) {
        return existingObject;
    }

    var entity = (0, _lodash2.default)(entities, [type, id]);

    if (entity === undefined) {
        return undefined;
    }

    // Construct the new base denormalized object and add it to the existing map
    var obj = (0, _extends3.default)({
        id: id,
        type: type
    }, (0, _humps.camelizeKeys)(entity.attributes));
    (0, _lodash4.default)(existingObjects, [type, id], obj);

    var relationships = (0, _lodash2.default)(entity, 'relationships', {});
    (0, _lodash6.default)(relationships, function (relationship, key) {
        var refOrRefs = relationship.data; // The { id, type } pointers stored on 'data' key
        var camelizedKey = (0, _humps.camelize)(key);

        if (refOrRefs === null) {
            obj[camelizedKey] = null;
            return;
        } else if (!Array.isArray(refOrRefs)) {
            obj[camelizedKey] = denormalize(refOrRefs, entities, existingObjects);
        } else {
            obj[camelizedKey] = refOrRefs.map(function (_ref) {
                // eslint-disable-line
                return denormalize(_ref, entities, existingObjects);
            });
        }

        // Establish a "_ref" property on the relationship object, that acts as a pointer to the
        // original entity
        if (obj[camelizedKey] && !obj[camelizedKey]._ref) {
            obj._ref = (0, _lodash8.default)({}, relationship);
        }
    });

    // Establish a "_ref" property on the object, that acts as a pointer to the original entity
    if (!obj._ref) {
        obj._ref = { value: { data: { id: id, type: type } } };
    }
    return obj;
}
module.exports = exports['default'];