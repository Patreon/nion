'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.makeRef = undefined;

var _lodash = require('lodash.map');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.every');

var _lodash4 = _interopRequireDefault(_lodash3);

var _denormalize = require('../denormalize');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var makeRef = exports.makeRef = function makeRef() {
    var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    // Can pass in a plain object from selectData, since these objects get populated with a _ref to
    // their original { id, type } entity information
    var toProcess = (0, _denormalize.hasEntityReference)(input) ? (0, _denormalize.getEntityReference)(input) : input;

    // Get all relevant information off of the object to be processed
    var links = toProcess.links,
        meta = toProcess.meta,
        isCollection = toProcess.isCollection,
        entities = toProcess.entities;

    // If the passed in object has a data key (from relationship, for example), use that to build
    // the new entities list

    if (toProcess.data) {
        if (toProcess.data instanceof Array) {
            entities = (0, _lodash2.default)(toProcess.data, function (_ref) {
                var type = _ref.type,
                    id = _ref.id;
                return { type: type, id: id };
            });
            isCollection = true;
        } else {
            var _toProcess$data = toProcess.data,
                type = _toProcess$data.type,
                id = _toProcess$data.id;

            entities = [{ type: type, id: id }];
            isCollection = isCollection || false;
        }
    } else if (toProcess.type && toProcess.id) {
        // If the input data is a flat entity, we'll need to construct a ref to that entity
        entities = [{ type: toProcess.type, id: toProcess.id }];
        isCollection = false;
    } else if (isArrayOfItems(toProcess)) {
        entities = toProcess.map(function (item) {
            return { type: item.type, id: item.id };
        });
        isCollection = true;
    } else {
        entities = [];
    }

    if (options.isCollection) {
        isCollection = true;
    }

    return {
        entities: entities,
        isCollection: isCollection,
        links: links,
        meta: meta
    };
};

function isArrayOfItems(items) {
    return items instanceof Array && (0, _lodash4.default)(items, function (item) {
        return item.id !== undefined && item.type;
    });
}