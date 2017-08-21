'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

exports.exists = exists;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash.difference');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.get');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.map');

var _lodash6 = _interopRequireDefault(_lodash5);

var _lodash7 = require('lodash.omit');

var _lodash8 = _interopRequireDefault(_lodash7);

var _lodash9 = require('lodash.set');

var _lodash10 = _interopRequireDefault(_lodash9);

var _actions = require('../actions');

var _actions2 = _interopRequireDefault(_actions);

var _transforms = require('../transforms');

var _api = require('../api');

var _api2 = _interopRequireDefault(_api);

var _reactRedux = require('react-redux');

var _types = require('../actions/types');

var _selectors = require('../selectors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultDeclarationOptions = {
    // Component / API Lifecycle methods
    fetchOnInit: false, // Should the component load the data when a new dataKey is created?
    fetchOnce: true, // Should the component only load the data once when dataKey is created?

    // Manual ref initialization, for parent/child data management relationships
    initialRef: null,

    // Special request type parameters
    paginated: false,

    // Specify the API used to request and parse API data
    apiType: _api2.default.getDefaultApi(),

    // Set custom request parameters
    requestParams: {},

    // Custom response json parser for the declaration: (json) => parsed
    parseResponse: undefined
};

function processDefaultOptions(declarations) {
    (0, _lodash6.default)(declarations, function (declaration, key) {
        (0, _lodash6.default)(defaultDeclarationOptions, function (defaultState, defaultKey) {
            var option = (0, _lodash4.default)(declaration, defaultKey, defaultState);
            declaration[defaultKey] = option;
        });
    });
}

function processDeclarations(inputDeclarations) {
    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        rest[_key - 1] = arguments[_key];
    }

    var declarations = void 0;

    function defineDataProperty(obj, key, value) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: false
        });
    }

    // The passed in declarations object is a map of dataKeys to fetch and their corresponding
    // params. We need to handle both the component-scoped key (the key of the object passed to
    // the decorator) as well as the dataKey that points to where the ref / request is stored on
    // the state tree
    var mapDeclarations = function mapDeclarations(fn) {
        return (0, _lodash6.default)(declarations, function (declaration, key) {
            return fn(declaration, key, declaration.dataKey || key);
        });
    };

    // Construct the JSON API selector to map to props
    var mapStateToProps = function mapStateToProps(state, ownProps) {
        // Process the input declarations, ensuring we make a copy of the original argument to
        // prevent object reference bugs between instances of the decorated class
        declarations = inputDeclarations instanceof Function ? inputDeclarations(ownProps) : clone(inputDeclarations);

        // Otherwise, if the passed in declarartions are a string (shorthand dataKey selection),
        // create a declaration object
        if (typeof inputDeclarations === 'string') {
            declarations = {};
            (0, _lodash6.default)([inputDeclarations].concat(rest), function (dataKey) {
                declarations[dataKey] = {};
            });
        }

        // Apply default options to the declarations
        processDefaultOptions(declarations);

        // We want to pass in the selected data to the wrapped component by the key (ie pledge),
        // even though we may be storing the data on the store by an id-specific dataKey (ie
        // pledge:1234). We'll need to make a map from dataKey to key to handle passing the props
        // more semantically to the wrapped component. We'll need these dataKeys for creating our
        // selector as well.
        var keysByDataKey = {};
        var dataKeys = mapDeclarations(function (declaration, key, dataKey) {
            // If the dataKey already exists in this group of declarations, throw an error!
            if (keysByDataKey[dataKey]) {
                throw new Error('Duplicate dataKeys detected in this nion decorator');
            }

            keysByDataKey[dataKey] = key;

            // Ensure the dataKey is set properly on the declaration
            declaration.dataKey = declaration.dataKey || key;

            return dataKey;
        });

        var selectedResources = (0, _selectors.selectResourcesForKeys)(dataKeys)(state);

        var nion = {};

        // Now map back over the dataKeys to their original keys
        (0, _lodash6.default)(selectedResources, function (selected, selectedDataKey) {
            var key = keysByDataKey[selectedDataKey];

            // If the ref doesn't yet exist, we need to ensure we can pass an object with
            // 'request' and 'actions' props to the child component so it can manage loading the
            // data. Therefore, we'll create a "NonExistentObject" (an empty object with a
            // hidden property) to pass down to the child component. This can interface with the
            // "exists" function to tell if the data exists yet
            var refDoesNotExist = selected.obj === undefined || null;
            nion[key] = refDoesNotExist ? makeNonExistingObject() : makeExistingObject(selected.obj);

            // Define the nion-specific properties as non-enumerable properties on the dataKey prop.
            // TODO: links and meta are JSON-API specific properties on the reference that we need
            // to decide how to handle in an API-agnostic way
            defineDataProperty(nion[key], 'actions', {});
            defineDataProperty(nion[key], 'request', (0, _extends3.default)({}, selected.request));

            // Define nion properties from any extra props on the ref, which may be added by an API
            // module after parsing (eg links, meta from the JSON-API module)
            var extraProps = Object.keys((0, _lodash8.default)(selected, ['obj', 'request']));
            (0, _lodash6.default)(extraProps, function (prop) {
                var extraProp = (0, _typeof3.default)(selected[prop]) === 'object' ? declarations[selectedDataKey].apiType === 'api' ? selected[prop] : (0, _extends3.default)({}, selected[prop]) : selected[prop];
                defineDataProperty(nion[key], prop, extraProp);
            });
        });

        return { nion: nion };
    };

    // Construct the dispatch methods to pass action creators to the component
    var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
        var dispatchProps = {};

        // Helper method to construct a url endpoint from supplied declaration and params.
        // This will be used to build the endpoints for the various method actions
        function getUrl(declaration, params) {
            var endpoint = (0, _lodash4.default)(declaration, 'endpoint');
            var buildUrl = _api2.default.getBuildUrl(declaration.apiType);

            // If supplied endpoint override at call time, then use the supplied endpoint
            if ((0, _lodash4.default)(params, 'endpoint')) {
                endpoint = params.endpoint;
                params = (0, _lodash8.default)(params, ['endpoint']);
            }

            // Use if a fully-formed url, otherwise pass to buildUrl
            return typeof buildUrl === 'undefined' || typeof endpoint === 'undefined' || endpoint.indexOf('https://') === 0 || endpoint.indexOf('http://') === 0 ? endpoint : buildUrl(endpoint, params);
        }

        // Map over the supplied declarations to build out the 4 main methods to add to the actions
        // subprop, as well as the special case next method for paginated resources
        mapDeclarations(function (declaration, key, dataKey) {
            dispatchProps[key] = {};

            dispatchProps[key]['POST'] = function () {
                var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                var params = arguments[1];
                var actionOptions = arguments[2];

                var endpoint = getUrl(declaration, params);

                return _actions2.default.post(dataKey, {
                    endpoint: endpoint,
                    declaration: declaration,
                    body: body,
                    meta: {
                        append: (0, _lodash4.default)(actionOptions, 'append')
                    }
                })(dispatch);
            };

            dispatchProps[key]['PATCH'] = function () {
                var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                var params = arguments[1];

                var endpoint = getUrl(declaration, params);
                return _actions2.default.patch(dataKey, {
                    endpoint: endpoint,
                    declaration: declaration,
                    body: body
                })(dispatch);
            };

            dispatchProps[key]['GET'] = function (params) {
                var endpoint = getUrl(declaration, params);
                return _actions2.default.get(dataKey, {
                    declaration: declaration,
                    endpoint: endpoint
                })(dispatch);
            };

            dispatchProps[key]['DELETE'] = function () {
                var refToDelete = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                var params = arguments[1];
                var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                if (options.refToDelete) {
                    refToDelete = options.refToDelete;
                }
                var endpoint = getUrl(declaration, params);
                return _actions2.default.delete(dataKey, {
                    declaration: declaration,
                    endpoint: endpoint,
                    refToDelete: refToDelete
                })(dispatch);
            };

            if (declaration.paginated) {
                dispatchProps[key]['NEXT'] = function (params) {
                    var next = params.next;

                    var endpoint = params.endpoint || next;

                    return _actions2.default.next(dataKey, {
                        declaration: declaration,
                        endpoint: endpoint
                    })(dispatch);
                };
            }

            // Exposed, general nion data manipulating actions
            dispatchProps[key].updateRef = function (ref) {
                return new Promise(function (resolve, reject) {
                    dispatch({
                        type: _types.UPDATE_REF,
                        payload: {
                            dataKey: declaration.dataKey,
                            ref: (0, _transforms.makeRef)(ref)
                        }
                    });
                    resolve();
                });
            };
        });

        // Private, internal nion data manipulating actions
        dispatchProps._initializeDataKey = function (dataKey, ref) {
            dispatch({
                type: _types.INITIALIZE_DATAKEY,
                payload: { dataKey: dataKey, ref: ref }
            });
        };

        // Exposed, general nion data manipulating actions
        dispatchProps.updateEntity = function (_ref, attributes) {
            var type = _ref.type,
                id = _ref.id;

            return new Promise(function (resolve, reject) {
                dispatch(_actions2.default.updateEntity({ type: type, id: id }, attributes));
                resolve();
            });
        };

        return dispatchProps;
    };

    // Now, transform the dispatch props (<ref>Request) into methods on the nion.action prop
    function mergeProps(stateProps, dispatchProps, ownProps) {
        var nextProps = (0, _extends3.default)({}, stateProps, ownProps);

        mapDeclarations(function (declaration, key, dataKey) {
            var data = (0, _lodash4.default)(stateProps.nion, key);
            var ref = data ? { id: data.id, type: data.type } : null;

            // Add each method's corresponding request handler to the nextProps[key].request
            // object
            var methods = ['GET', 'PATCH', 'POST'];
            methods.forEach(function (method) {
                var dispatchFn = dispatchProps[key][method];
                (0, _lodash10.default)(nextProps.nion, [key, 'actions', method.toLowerCase()], dispatchFn);
            });

            // Handle deletion, where we're passing in the ref attached to the dataKey to be deleted
            var deleteDispatchFn = dispatchProps[key]['DELETE'];
            var deleteFn = function deleteFn(props, options) {
                return deleteDispatchFn(ref, props, options);
            };
            (0, _lodash10.default)(nextProps.nion, [key, 'actions', 'delete'], deleteFn);

            // Handle the special NEXT submethod, for paginated declarations
            if (declaration.paginated) {
                var dispatchFn = dispatchProps[key]['NEXT'];
                var pagination = _api2.default.getPagination(declaration.apiType);

                var selectedData = (0, _lodash4.default)(stateProps.nion, key);
                var nextUrl = pagination.getNextUrl(declaration, selectedData);

                if (nextUrl) {
                    var nextFn = function nextFn(params) {
                        return dispatchFn((0, _extends3.default)({}, params, { next: nextUrl }));
                    };
                    (0, _lodash10.default)(nextProps.nion, [key, 'actions', 'next'], nextFn);
                }

                // Add in a special "canLoadMore" prop to the request if the pagination module
                // exists
                if (pagination.canLoadMore) {
                    var canLoadMore = pagination.canLoadMore(nextProps.nion[key]);
                    (0, _lodash10.default)(nextProps.nion, [key, 'request', 'canLoadMore'], canLoadMore);
                }
            }

            (0, _lodash10.default)(nextProps.nion, [key, 'actions', 'updateRef'], dispatchProps[key].updateRef);
        });

        if (dispatchProps._initializeDataKey) {
            nextProps.nion._initializeDataKey = dispatchProps._initializeDataKey;
        }

        // Pass along the global nion action creators
        nextProps.nion.updateEntity = dispatchProps.updateEntity;
        nextProps.nion._declarations = declarations;

        return nextProps;
    }

    return {
        mapStateToProps: mapStateToProps,
        mapDispatchToProps: mapDispatchToProps,
        mergeProps: mergeProps
    };
}

// JSON API decorator function for wrapping connected components to the new JSON API redux system
var nion = function nion() {
    for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        rest[_key2 - 1] = arguments[_key2];
    }

    var declarations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return function (WrappedComponent) {
        var _class, _temp;

        var _processDeclarations = processDeclarations.apply(undefined, [declarations].concat(rest)),
            mapStateToProps = _processDeclarations.mapStateToProps,
            mapDispatchToProps = _processDeclarations.mapDispatchToProps,
            mergeProps = _processDeclarations.mergeProps;

        // Track the status of fetch actions to avoid sending out duplicate requests, since props can
        // change multiple times before the redux store has updated (our nion actions are async)


        var fetchesByDataKey = {};

        var WithNion = (_temp = _class = function (_Component) {
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
                key: 'initializeDataKeys',
                value: function initializeDataKeys(props) {
                    var nion = props.nion; // eslint-disable-line no-shadow

                    // We want to trigger a fetch when the props change and lead to the creation of a new
                    // dataKey, regardless of whether or not that happens as a result of a mount.

                    (0, _lodash6.default)(nion._declarations, function (declaration, key) {
                        // eslint-disable-line no-shadow
                        // If not fetching on init, don't do anything
                        if (!declaration.fetchOnInit) {
                            return;
                        }

                        var fetch = nion[key].actions.get;
                        var status = nion[key].request.status;
                        var dataKey = declaration.dataKey;

                        // We need to manually check the status of the pending fetch action promise, since
                        // parent components may send props multiple times to the wrapped component (ie
                        // during setState). Because our redux actions are async, the redux store will not
                        // be updated before the next componentWillReceiveProps, so looking at the redux
                        // request status will be misleading because it will not have been updated
                        var isFetchPending = !!fetchesByDataKey[dataKey];

                        // If the fetch is only to be performed once, don't fetch if already loaded
                        if (declaration.fetchOnce) {
                            if (isNotLoaded(status) && !isFetchPending) {
                                fetchesByDataKey[dataKey] = fetch().then(function () {
                                    fetchesByDataKey[dataKey] = null;
                                });
                            }
                        } else {
                            if (isNotLoading(status) && !isFetchPending) {
                                fetchesByDataKey[dataKey] = fetch().then(function () {
                                    fetchesByDataKey[dataKey] = null;
                                });
                            }
                        }
                    });
                }
            }, {
                key: 'componentDidMount',
                value: function componentDidMount() {
                    var nion = this.props.nion; // eslint-disable-line no-shadow

                    // Iterate over the declarations provided to the component, deciding how to manage the
                    // load state of each one

                    (0, _lodash6.default)(nion._declarations, function (declaration, key) {
                        // eslint-disable-line no-shadow
                        // If we're supplying a ref to be managed by nion, we'll want to attach it to the
                        // state tree ahead of time (maybe not? maybe we want to have a "virtual" ref...
                        // this is interesting)
                        if (declaration.initialRef) {
                            // If a ref has already been attached to the dataKey, don't dispatch it again...
                            // this triggers a cascading rerender which will cause an infinite loop
                            if (exists(nion[key])) {
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
                    var nextProps = (0, _extends3.default)({}, this.props, {
                        nion: finalProcessProps(this.props.nion)
                    });

                    return _react2.default.createElement(WrappedComponent, nextProps);
                }
            }]);
            return WithNion;
        }(_react.Component), _class.displayName = 'WithNion(' + getDisplayName(WrappedComponent) + ')', _class.propTypes = {
            nion: _react.PropTypes.object.isRequired
        }, _temp);


        var connectedComponent = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps, mergeProps)(WithNion);
        // Take all static properties on the inner Wrapped component and put them on our now-connected
        // component. // This makes nion transparent and safe to add as a decorator; it does not occlude
        // the shape of the inner component.
        (0, _lodash2.default)(Object.keys(WrappedComponent), Object.keys(connectedComponent)).map(function (key) {
            connectedComponent[key] = WrappedComponent[key];
        });
        return connectedComponent;
    };
};

exports.default = nion;

// ----------------------------- Helper functions

// Test for the existence of a nion[key] object. If we don't yet have any data attached to a
// dataKey, nion will still pass down an empty object with "request" and "actions" props in order to
// manage loading the corresponding data. This method tests to see if that object has data
// associated with it.

function exists() {
    var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (input === null || input === undefined) {
        return defaultValue;
    }

    if (input._exists !== undefined && input._exists) {
        return input._exists;
    }

    var testExists = function testExists(obj) {
        return !!(obj.id && obj.type);
    };

    if (input instanceof Array) {
        return input.filter(testExists).length;
    } else {
        return testExists(input) || defaultValue;
    }

    return defaultValue;
}

function makeNonExistingObject() {
    var obj = {};
    Object.defineProperty(obj, '_exists', { value: false, enumerable: false });
    return obj;
}

function makeExistingObject(input) {
    var output = input instanceof Array ? [].concat((0, _toConsumableArray3.default)(input)) : (0, _extends3.default)({}, input);
    Object.defineProperty(output, '_exists', {
        value: true,
        enumerable: false
    });
    return output;
}

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function isNotLoading(status) {
    return status !== 'pending';
}

function isNotLoaded(status) {
    return status === 'not called';
}

// Filter out hidden props from the nion dataProp, including _declarations and _initializeDataKey,
// which are only used internally in the wrapper component. Expose a method getDeclarations that
// returns the removed declarations property
function finalProcessProps(dataProp) {
    var output = {};

    // Expose a getDeclarations method (used for testing)
    output.getDeclarations = function () {
        return dataProp._declarations;
    };

    (0, _lodash6.default)(dataProp, function (obj, key) {
        if (key === '_declarations' || key === '_initializeDataKey') {
            return;
        }
        output[key] = obj;
    });
    return output;
}

// Yes, a bit funny - but it turns out this is a safe, fast, and terse way of deep cloning data
function clone(input) {
    return JSON.parse(JSON.stringify(input));
}