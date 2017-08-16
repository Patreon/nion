'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getRequestParameters = exports.afterRequest = exports.beforeRequest = exports.JsonApiPayload = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var JsonApiPayload = exports.JsonApiPayload = function () {
    function JsonApiPayload(type, attributes) {
        (0, _classCallCheck3.default)(this, JsonApiPayload);

        this.attributes = (0, _extends3.default)({}, attributes);
        this.relationships = {};
        this.meta = {};
        this.type = type;
        this.included = [];
    }

    (0, _createClass3.default)(JsonApiPayload, [{
        key: 'addAttribute',
        value: function addAttribute(key, val) {
            this.attributes[key] = val;
        }

        // Relationship can either be a { type, id } object or [{ type, id }] array of objects - or, if
        // 'idOrData' is a string, then we can assume that we're passing in arguments of (type, id) and
        // the  relationship is simple

    }, {
        key: 'addRelationship',
        value: function addRelationship(relationship, idOrData) {
            var data = void 0;
            if (typeof idOrData === 'string') {
                data = { type: relationship, id: idOrData };
            } else {
                data = idOrData;
            }
            this.relationships[relationship] = { data: data };
        }
    }, {
        key: 'addMetaAttribute',
        value: function addMetaAttribute(key, val) {
            this.meta[key] = val;
        }
    }, {
        key: 'addInclude',
        value: function addInclude(type, id, attributes) {
            this.addRelationship(type, id);
            this.included.push({
                type: type,
                id: id,
                attributes: (0, _extends3.default)({}, attributes)
            });
        }
    }, {
        key: 'toRequest',
        value: function toRequest() {
            var request = {};
            request['data'] = {
                type: this.type,
                attributes: (0, _extends3.default)({}, this.attributes),
                relationships: (0, _extends3.default)({}, this.relationships)
            };

            if (Object.keys(this.meta).length) {
                request['meta'] = (0, _extends3.default)({}, this.meta);
            }

            if (this.included.length) {
                request['included'] = [].concat((0, _toConsumableArray3.default)(this.included));
            }
            return request;
        }
    }]);
    return JsonApiPayload;
}();

var beforeRequest = exports.beforeRequest = function beforeRequest(method, options) {
    return Promise.resolve();
};

var afterRequest = exports.afterRequest = function afterRequest(method, options) {
    return Promise.resolve();
};

var getRequestParameters = exports.getRequestParameters = function getRequestParameters(method, options, headersProvider) {
    return Promise.resolve().then(function () {
        if (headersProvider) {
            return headersProvider(method.toLowerCase());
        }
    }).then(function (headers) {
        return {
            credentials: 'include',
            headers: (0, _extends3.default)({}, headers, {
                'Content-Type': 'application/vnd.api+json'
            })
        };
    });
};
