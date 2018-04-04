'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _reactRedux = require('react-redux');

var _lodash = require('lodash.difference');

var _lodash2 = _interopRequireDefault(_lodash);

var _shouldRerender = require('./should-rerender');

var _processDeclarations2 = require('../declarations/process-declarations');

var _processDeclarations3 = _interopRequireDefault(_processDeclarations2);

var _WithNion = require('../components/WithNion');

var _WithNion2 = _interopRequireDefault(_WithNion);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// nion decorator function for wrapping connected components
var withNion = function withNion() {
    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        rest[_key - 1] = arguments[_key];
    }

    var declarations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return function (WrappedComponent) {
        var _processDeclarations = _processDeclarations3.default.apply(undefined, [declarations].concat(rest)),
            makeMapStateToProps = _processDeclarations.makeMapStateToProps,
            mapDispatchToProps = _processDeclarations.mapDispatchToProps,
            mergeProps = _processDeclarations.mergeProps;

        var connectedComponent = (0, _reactRedux.connect)(makeMapStateToProps, mapDispatchToProps, mergeProps, {
            areMergedPropsEqual: _shouldRerender.areMergedPropsEqual
        })((0, _WithNion2.default)(WrappedComponent));
        // Take all static properties on the inner Wrapped component and put them on our now-connected
        // component. // This makes nion transparent and safe to add as a decorator; it does not occlude
        // the shape of the inner component.
        (0, _lodash2.default)(Object.keys(WrappedComponent), Object.keys(connectedComponent)).map(function (key) {
            connectedComponent[key] = WrappedComponent[key];
        });
        return connectedComponent;
    };
};

exports.default = withNion;
module.exports = exports['default'];