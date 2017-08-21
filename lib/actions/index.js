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

        var apiType = declaration.apiType;


        var parse = _api2.default.getParser(apiType);
        var ErrorClass = _api2.default.getErrorClass(apiType);

        // Return our async / thunk API call manager
        return _dispatch(function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(dispatch, getState) {
                var requestParams, response, text, json, status, statusText, parseResponse, responseData;
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


                                // Add the request body if present
                                if (body) {
                                    requestParams.body = JSON.stringify(body);
                                }

                                _context.next = 9;
                                return (0, _isomorphicFetch2.default)(endpoint, (0, _extends3.default)({
                                    method: method
                                }, requestParams, declaration.requestParams));

                            case 9:
                                response = _context.sent;
                                _context.next = 12;
                                return response.text();

                            case 12:
                                text = _context.sent;
                                json = text ? JSON.parse(text) : {};

                                // Handle any request errors since fetch doesn't throw

                                if (response.ok) {
                                    _context.next = 17;
                                    break;
                                }

                                status = response.status, statusText = response.statusText;
                                throw new ErrorClass(status, statusText, (0, _extends3.default)({}, response, json));

                            case 17:

                                // If a parseResponse parameter is supplied to the declaration, we'll want to parse the
                                // data with both the parseResponse function and the api module parse function
                                parseResponse = declaration.parseResponse;

                                json = parseResponse ? parseResponse(json) : json;

                                // Parse the data with the parser from the API module
                                responseData = parse(json);
                                _context.next = 22;
                                return dispatch({
                                    type: _types.NION_API_SUCCESS,
                                    meta: meta,
                                    payload: {
                                        requestType: apiType,
                                        responseData: responseData
                                    }
                                });

                            case 22:
                                return _context.abrupt('return', (0, _selectors.selectData)(dataKey)(getState()));

                            case 25:
                                _context.prev = 25;
                                _context.t0 = _context['catch'](2);
                                _context.next = 29;
                                return dispatch({
                                    type: _types.NION_API_FAILURE,
                                    meta: meta,
                                    payload: _context.t0
                                });

                            case 29:
                                throw _context.t0;

                            case 30:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, undefined, [[2, 25]]);
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