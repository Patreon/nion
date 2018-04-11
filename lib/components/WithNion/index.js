'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _lodash = require('lodash.map');

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _exists = require('../../utilities/exists');

var _exists2 = _interopRequireDefault(_exists);

var _utilities = require('../../decorator/utilities');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function withNion(WrappedComponent) {
    var _class, _temp;

    // Track the status of fetch actions to avoid sending out duplicate requests, since props can
    // change multiple times before the redux store has updated (our nion actions are async)
    var fetchesByDataKey = {};

    return _temp = _class = function (_Component) {
        (0, _inherits3.default)(WithNion, _Component);

        function WithNion(props) {
            (0, _classCallCheck3.default)(this, WithNion);

            var _this = (0, _possibleConstructorReturn3.default)(this, (WithNion.__proto__ || Object.getPrototypeOf(WithNion)).call(this, props));

            _this.initializeDataKeys(props);
            return _this;
        }

        (0, _createClass3.default)(WithNion, [{
            key: 'componentWillReceiveProps',
            value: function componentWillReceiveProps(nextProps) {
                this.initializeDataKeys(nextProps);
            }
        }, {
            key: 'fetchDataAndUpdatePending',
            value: function fetchDataAndUpdatePending(action, dataKey) {
                fetchesByDataKey[dataKey] = action().then(function () {
                    fetchesByDataKey[dataKey] = null;
                });
            }
        }, {
            key: 'initializeDataKeys',
            value: function initializeDataKeys(props) {
                var _this2 = this;

                var nion = props.nion; // eslint-disable-line no-shadow

                // We want to trigger a fetch when the props change and lead to the creation of a new
                // dataKey, regardless of whether or not that happens as a result of a mount.

                (0, _lodash2.default)(nion._declarations, function (declaration, key) {
                    // eslint-disable-line no-shadow
                    // If not fetching on init, don't do anything
                    if (!declaration.fetchOnInit) {
                        return;
                    }

                    var get = nion[key].actions.get;
                    var status = nion[key].request.status;
                    var dataKey = declaration.dataKey;

                    // We need to manually check the status of the pending fetch action promise, since
                    // parent components may send props multiple times to the wrapped component (ie
                    // during setState). Because our redux actions are async, the redux store will not
                    // be updated before the next componentWillReceiveProps, so looking at the redux
                    // request status will be misleading because it will not have been updated
                    var isFetchPending = !!fetchesByDataKey[dataKey];

                    if (!!isFetchPending) {
                        return;
                    }

                    // If the fetch is only to be performed once, don't fetch if already loaded
                    if (declaration.fetchOnce && (0, _utilities.isNotLoaded)(status)) {
                        _this2.fetchDataAndUpdatePending(get, dataKey);
                    } else if ((0, _utilities.isNotLoading)(status)) {
                        _this2.fetchDataAndUpdatePending(get, dataKey);
                    }
                });
            }
        }, {
            key: 'componentDidMount',
            value: function componentDidMount() {
                var nion = this.props.nion; // eslint-disable-line no-shadow

                // Iterate over the declarations provided to the component, deciding how to manage the
                // load state of each one

                (0, _lodash2.default)(nion._declarations, function (declaration, key) {
                    // eslint-disable-line no-shadow
                    // If we're supplying a ref to be managed by nion, we'll want to attach it to the
                    // state tree ahead of time (maybe not? maybe we want to have a "virtual" ref...
                    // this is interesting)
                    if (declaration.initialRef) {
                        // If a ref has already been attached to the dataKey, don't dispatch it again...
                        // this triggers a cascading rerender which will cause an infinite loop
                        if ((0, _exists2.default)(nion[key].data)) {
                            return;
                        }

                        var dataKey = declaration.dataKey,
                            initialRef = declaration.initialRef;

                        return nion._initializeDataKey(dataKey, initialRef);
                    }
                });
            }
        }, {
            key: 'render',
            value: function render() {
                // Filter out internally used props to not expose them in the wrapped component
                var props = (0, _extends3.default)({}, this.props, {
                    nion: finalProcessProps(this.props.nion)
                });

                return _react2.default.createElement(WrappedComponent, props);
            }
        }]);
        return WithNion;
    }(_react.Component), _class.displayName = 'WithNion(' + (0, _utilities.getDisplayName)(WrappedComponent) + ')', _class.propTypes = { nion: _propTypes2.default.object.isRequired }, _temp;
}

exports.default = withNion;

// Filter out hidden props from the nion dataProp, including _declarations and _initializeDataKey,
// which are only used internally in the wrapper component. Expose a method getDeclarations that
// returns the removed declarations property

function finalProcessProps(nionProp) {
    var output = {};

    // Expose a getDeclarations method (used for testing) and updateEntity method (for optimistic
    // updates)
    output.getDeclarations = function () {
        return nionProp._declarations;
    };
    output.updateEntity = nionProp.updateEntity;

    return (0, _extends3.default)({}, nionProp, output);
}
module.exports = exports['default'];