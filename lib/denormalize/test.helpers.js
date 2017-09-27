'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.makeFriendsEntity = exports.makeFriendEntity = exports.makeUserEntity = exports.EntityStoreManager = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _id = 1;
var generateId = function generateId() {
    return String(_id++);
};

var EntityStoreManager = exports.EntityStoreManager = function EntityStoreManager() {
    var _this = this;

    (0, _classCallCheck3.default)(this, EntityStoreManager);
    this.store = (0, _seamlessImmutable2.default)({});

    this.addEntity = function (_ref) {
        var type = _ref.type,
            id = _ref.id,
            rest = (0, _objectWithoutProperties3.default)(_ref, ['type', 'id']);

        _this.store = _this.store.merge((0, _defineProperty3.default)({}, type, (0, _defineProperty3.default)({}, id, (0, _extends3.default)({
            type: type,
            id: id
        }, rest))), { deep: true });
        return _this.store[type][id];
    };

    this.updateEntity = function () {
        _this.addEntity.apply(_this, arguments);
    };

    this.removeEntity = function (_ref2) {
        var type = _ref2.type,
            id = _ref2.id;

        _this.store = _this.store.merge((0, _defineProperty3.default)({}, type, (0, _defineProperty3.default)({}, id, undefined)), { deep: true });
    };
};

var makeUserEntity = exports.makeUserEntity = function makeUserEntity() {
    var id = generateId();
    return {
        type: 'user',
        id: id,
        attributes: {
            name: 'Test User ' + id
        }
    };
};

var makeFriendEntity = exports.makeFriendEntity = function makeFriendEntity(friendId) {
    var id = generateId();
    return {
        type: 'user',
        id: id,
        attributes: {
            name: 'Friend User ' + id
        },
        relationships: {
            friend: {
                data: {
                    type: 'user',
                    id: friendId
                }
            }
        }
    };
};

var makeFriendsEntity = exports.makeFriendsEntity = function makeFriendsEntity(friendIds) {
    var id = generateId();
    return {
        type: 'user',
        id: id,
        attributes: {
            name: 'Friend User ' + id
        },
        relationships: {
            friends: {
                data: friendIds.map(function (friendId) {
                    return {
                        type: 'user',
                        id: friendId
                    };
                })
            }
        }
    };
};