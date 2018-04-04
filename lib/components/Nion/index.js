'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _dec, _class, _class2, _temp;

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _decorator = require('../../decorator');

var _decorator2 = _interopRequireDefault(_decorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Nion = (_dec = (0, _decorator2.default)(function (_ref) {
    var declaration = _ref.declaration;
    return declaration;
}), _dec(_class = (_temp = _class2 = function (_Component) {
    (0, _inherits3.default)(Nion, _Component);

    function Nion() {
        (0, _classCallCheck3.default)(this, Nion);
        return (0, _possibleConstructorReturn3.default)(this, (Nion.__proto__ || Object.getPrototypeOf(Nion)).apply(this, arguments));
    }

    (0, _createClass3.default)(Nion, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                nion = _props.nion,
                render = _props.render,
                declaration = _props.declaration;

            var dataKey = (0, _lodash2.default)(Object.keys(declaration), '0');
            var nionObject = (0, _lodash2.default)(nion, dataKey);
            return render(nionObject);
        }
    }]);
    return Nion;
}(_react.Component), _class2.propTypes = {
    render: _propTypes2.default.func.isRequired,
    nion: _propTypes2.default.object.isRequired,
    declaration: _propTypes2.default.object.isRequired
}, _temp)) || _class);
exports.default = Nion;
module.exports = exports['default'];