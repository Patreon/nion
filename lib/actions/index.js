'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _api = require('../api');

var _api2 = _interopRequireDefault(_api);

var _types = require('./types');

var _selectors = require('../selectors');

var _lifecycle = require('../lifecycle');

var _lifecycle2 = _interopRequireDefault(_lifecycle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var apiAction = function apiAction(method, dataKey, options) {
    return function (_dispatch) {
        var body = options.body,
            _options$declaration = options.declaration,
            declaration = _options$declaration === undefined ? {} : _options$declaration,
            endpoint = options.endpoint;


        var meta = (0, _extends3.default)({}, options.meta, {
            dataKey: dataKey,
            endpoint: endpoint,
            method: method
        });

        var _declaration$apiType = declaration.apiType,
            apiType = _declaration$apiType === undefined ? _api2.default.getDefaultApi() : _declaration$apiType;


        var parse = _api2.default.getParser(apiType);
        var ErrorClass = _api2.default.getErrorClass(apiType);

        // Return our async / thunk API call manager
        return _dispatch(function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(dispatch, getState) {
                var requestParams, response, text, json, status, statusText;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return dispatch({
                                    type: _types.NION_API_REQUEST,
                                    meta: meta
                                });

                            case 2:
                                _context.prev = 2;
                                _context.next = 5;
                                return _api2.default.getRequestParameters(apiType, method, options);

                            case 5:
                                requestParams = _context.sent;


                                _lifecycle2.default.onRequest({
                                    method: method,
                                    dataKey: dataKey,
                                    requestParams: requestParams,
                                    meta: meta,
                                    declaration: declaration
                                });

                                // Add the request body if present
                                if (body) {
                                    requestParams.body = JSON.stringify(body);
                                }

                                _context.next = 10;
                                return (0, _isomorphicFetch2.default)(endpoint, (0, _extends3.default)({
                                    method: method
                                }, requestParams, declaration.requestParams));

                            case 10:
                                response = _context.sent;


                                _lifecycle2.default.onSuccess({
                                    method: method,
                                    dataKey: dataKey,
                                    requestParams: requestParams,
                                    response: response,
                                    meta: meta,
                                    declaration: declaration
                                });

                                // Handle the case that calling response.json() on null responses throws a syntax error
                                _context.next = 14;
                                return response.text();

                            case 14:
                                text = _context.sent;
                                json = text ? JSON.parse(text) : {};

                                // Handle any request errors since fetch doesn't throw

                                if (response.ok) {
                                    _context.next = 19;
                                    break;
                                }

                                status = response.status, statusText = response.statusText;
                                throw new ErrorClass(status, statusText, (0, _extends3.default)({}, response, json));

                            case 19:
                                _context.next = 21;
                                return dispatch({
                                    type: _types.NION_API_SUCCESS,
                                    meta: (0, _extends3.default)({}, meta, {
                                        fetchedAt: Date.now()
                                    }),
                                    payload: {
                                        requestType: apiType,
                                        responseData: parse(json)
                                    }
                                });

                            case 21:
                                return _context.abrupt('return', (0, _selectors.selectData)(dataKey)(getState()));

                            case 24:
                                _context.prev = 24;
                                _context.t0 = _context['catch'](2);

                                _lifecycle2.default.onFailure({ method: method, dataKey: dataKey, error: _context.t0, meta: meta, declaration: declaration });
                                _context.prev = 27;
                                _context.next = 30;
                                return dispatch({
                                    type: _types.NION_API_FAILURE,
                                    meta: (0, _extends3.default)({}, meta, {
                                        fetchedAt: Date.now()
                                    }),
                                    payload: _context.t0
                                });

                            case 30:
                                _context.next = 35;
                                break;

                            case 32:
                                _context.prev = 32;
                                _context.t1 = _context['catch'](27);

                                // We probably want to catch any render errors here, logging them but actually
                                // throwing the api error that caused it
                                console.error(_context.t1);

                            case 35:
                                throw _context.t0;

                            case 36:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, undefined, [[2, 24], [27, 32]]);
            }));

            return function (_x, _x2) {
                return _ref.apply(this, arguments);
            };
        }());
    };
};

var getAction = function getAction(dataKey, options) {
    return apiAction('GET', dataKey, options);
};

var postAction = function postAction(dataKey, options) {
    return apiAction('POST', dataKey, options);
};

var patchAction = function patchAction(dataKey, options) {
    return apiAction('PATCH', dataKey, options);
};

var deleteAction = function deleteAction(dataKey, options) {
    return apiAction('DELETE', dataKey, (0, _extends3.default)({}, options, {
        meta: (0, _extends3.default)({}, options.meta, {
            refToDelete: options.refToDelete
        })
    }));
};

var nextAction = function nextAction(dataKey, options) {
    return apiAction('GET', dataKey, (0, _extends3.default)({}, options, {
        meta: (0, _extends3.default)({}, options.meta, {
            isNextPage: true
        })
    }));
};

var bootstrapAction = function bootstrapAction(_ref2) {
    var apiType = _ref2.apiType,
        dataKey = _ref2.dataKey,
        data = _ref2.data;

    var parse = _api2.default.getParser(apiType);
    return {
        type: _types.NION_API_BOOTSTRAP,
        meta: { dataKey: dataKey },
        payload: {
            apiType: apiType,
            responseData: parse(data)
        }
    };
};

var updateEntityAction = function updateEntityAction(_ref3, attributes) {
    var type = _ref3.type,
        id = _ref3.id;

    return {
        type: _types.UPDATE_ENTITY,
        payload: { type: type, id: id, attributes: attributes }
    };
};

exports.default = {
    get: getAction,
    post: postAction,
    patch: patchAction,
    delete: deleteAction,
    next: nextAction,
    bootstrap: bootstrapAction,
    updateEntity: updateEntityAction
};
module.exports = exports['default'];