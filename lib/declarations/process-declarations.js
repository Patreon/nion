'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _lodash = require('lodash.get');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.map');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.set');

var _lodash6 = _interopRequireDefault(_lodash5);

var _actions = require('../actions');

var _actions2 = _interopRequireDefault(_actions);

var _transforms = require('../transforms');

var _api = require('../api');

var _api2 = _interopRequireDefault(_api);

var _extensions = require('../extensions');

var _extensions2 = _interopRequireDefault(_extensions);

var _types = require('../actions/types');

var _selectors = require('../selectors');

var _processDefaultOptions = require('../declarations/process-default-options');

var _processDefaultOptions2 = _interopRequireDefault(_processDefaultOptions);

var _clone = require('../utilities/clone');

var _clone2 = _interopRequireDefault(_clone);

var _utilities = require('../decorator/utilities');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var processDeclarations = function processDeclarations(inputDeclarations) {
    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        rest[_key - 1] = arguments[_key];
    }

    var declarations = void 0;

    // The passed in declarations object is a map of dataKeys to fetch and their corresponding
    // params. We need to handle both the component-scoped key (the key of the object passed to
    // the decorator) as well as the dataKey that points to where the ref / request is stored on
    // the state tree
    var mapDeclarations = function mapDeclarations(fn) {
        return (0, _lodash4.default)(declarations, function (declaration, key) {
            return fn(declaration, key, declaration.dataKey || key);
        });
    };

    // Construct the nion selector to map to props
    var makeMapStateToProps = function makeMapStateToProps() {
        var mapStateToProps = function mapStateToProps(state, ownProps) {
            // Process the input declarations, ensuring we make a copy of the original argument to
            // prevent object reference bugs between instances of the decorated class
            declarations = inputDeclarations instanceof Function ? inputDeclarations(ownProps) : (0, _clone2.default)(inputDeclarations);

            // Otherwise, if the passed in declarartions are a string (shorthand dataKey selection),
            // create a declaration object
            if (typeof inputDeclarations === 'string') {
                declarations = {};
                (0, _lodash4.default)([inputDeclarations].concat(rest), function (dataKey) {
                    declarations[dataKey] = {};
                });
            }

            // Apply default options to the declarations
            (0, _processDefaultOptions2.default)(declarations);

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

            var selectedResources = (0, _selectors.selectResourcesForKeys)(dataKeys, true)(state);

            var nion = {};

            // Now map back over the dataKeys to their original keys
            (0, _lodash4.default)(selectedResources, function (selected, selectedDataKey) {
                var key = keysByDataKey[selectedDataKey];
                nion[key] = {};

                // If the ref doesn't yet exist, we need to ensure we can pass an object with
                // 'request' and 'actions' props to the child component so it can manage loading the
                // data. Therefore, we'll create a "NonExistentObject" (an empty object with a
                // hidden property) to pass down to the child component. This can interface with the
                // "exists" function to tell if the data exists yet
                var refDoesNotExist = selected.obj === undefined || null;
                nion[key].data = refDoesNotExist ? null : selected.obj;

                // Define the nion-specific properties as properties on the dataKey prop.
                nion[key].actions = {};
                nion[key].request = selected.request;
                nion[key].extra = selected.extra;
                nion[key].extensions = {};
            });

            return { nion: nion };
        };
        return mapStateToProps;
    };

    // Construct the dispatch methods to pass action creators to the component
    var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
        var dispatchProps = {};

        // Map over the supplied declarations to build out the 4 main methods to add to the actions
        // subprop, as well as the special case next method for paginated resources
        mapDeclarations(function (declaration, key, dataKey) {
            dispatchProps[key] = {};
            var buildUrl = _api2.default.getBuildUrl(declaration.apiType);

            dispatchProps[key]['POST'] = function () {
                var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                var params = arguments[1];
                var actionOptions = arguments[2];

                var endpoint = (0, _utilities.getUrl)(declaration, params, buildUrl);
                return _actions2.default.post(dataKey, {
                    endpoint: endpoint,
                    declaration: declaration,
                    body: body,
                    meta: {
                        append: (0, _lodash2.default)(actionOptions, 'append')
                    }
                })(dispatch);
            };

            dispatchProps[key]['PATCH'] = function () {
                var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                var params = arguments[1];

                var endpoint = (0, _utilities.getUrl)(declaration, params, buildUrl);
                return _actions2.default.patch(dataKey, {
                    endpoint: endpoint,
                    declaration: declaration,
                    body: body
                })(dispatch);
            };

            dispatchProps[key]['GET'] = function (params) {
                var actionOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                var endpoint = (0, _utilities.getUrl)(declaration, params, buildUrl);
                return _actions2.default.get(dataKey, {
                    declaration: declaration,
                    endpoint: endpoint,
                    meta: {
                        append: (0, _lodash2.default)(actionOptions, 'append')
                    }
                })(dispatch);
            };

            dispatchProps[key]['DELETE'] = function () {
                var refToDelete = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                var params = arguments[1];
                var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                // TODO: Refactor ref to delete to not be mutative.
                if (options.refToDelete) {
                    refToDelete = options.refToDelete;
                }
                var endpoint = (0, _utilities.getUrl)(declaration, params, buildUrl);
                return _actions2.default.delete(dataKey, (0, _extends3.default)({}, options, {
                    declaration: declaration,
                    endpoint: endpoint,
                    refToDelete: refToDelete
                }))(dispatch);
            };

            // Exposed, general nion data manipulating actions
            dispatchProps[key].updateRef = function (ref) {
                return new Promise(function (resolve, reject) {
                    dispatch({
                        type: _types.UPDATE_REF,
                        payload: {
                            ref: (0, _transforms.makeRef)(ref)
                        },
                        meta: {
                            dataKey: declaration.dataKey
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
                payload: { ref: ref },
                meta: { dataKey: dataKey }
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
    var mergeProps = function mergeProps(stateProps, dispatchProps, ownProps) {
        var nextProps = (0, _extends3.default)({}, stateProps, ownProps);

        mapDeclarations(function (declaration, key, dataKey) {
            var resource = (0, _lodash2.default)(stateProps.nion, [key]);
            var data = (0, _lodash2.default)(resource, ['data']);
            var ref = data ? { id: data.id, type: data.type } : null;

            // Add each method's corresponding request handler to the nextProps[key].request
            // object
            var methods = ['GET', 'PATCH', 'POST'];
            methods.forEach(function (method) {
                var dispatchFn = dispatchProps[key][method];
                (0, _lodash6.default)(nextProps.nion, [key, 'actions', method.toLowerCase()], dispatchFn);
            });

            // Handle deletion, where we're passing in the ref attached to the dataKey to be deleted
            var deleteDispatchFn = dispatchProps[key]['DELETE'];
            var deleteFn = function deleteFn(props, options) {
                return deleteDispatchFn(ref, props, options);
            };
            (0, _lodash6.default)(nextProps.nion, [key, 'actions', 'delete'], deleteFn);

            // Process extensions
            (0, _lodash4.default)(declaration.extensions, function (options, extension) {
                (0, _lodash4.default)(_extensions2.default.composeActionsForExtension(extension, options, resource), function (action, actionKey) {
                    (0, _lodash6.default)(nextProps.nion, [key, 'extensions', extension, actionKey], action);
                });

                (0, _lodash4.default)(_extensions2.default.composeMetaForExtension(extension, options, resource), function (metaValue, metaKey) {
                    (0, _lodash6.default)(nextProps.nion, [key, 'extensions', extension, 'meta', metaKey], metaValue);
                });
            });

            (0, _lodash6.default)(nextProps.nion, [key, 'actions', 'updateRef'], dispatchProps[key].updateRef);
        });

        // Pass along the nion decorator-internal methods for initialization
        (0, _utilities.defineNonEnumerable)(nextProps.nion, '_declarations', declarations);
        (0, _utilities.defineNonEnumerable)(nextProps.nion, '_initializeDataKey', dispatchProps._initializeDataKey);

        // Pass along the global nion action creators
        (0, _utilities.defineNonEnumerable)(nextProps.nion, 'updateEntity', dispatchProps.updateEntity);

        return nextProps;
    };

    return {
        makeMapStateToProps: makeMapStateToProps,
        mapDispatchToProps: mapDispatchToProps,
        mergeProps: mergeProps
    };
};

exports.default = processDeclarations;
module.exports = exports['default'];