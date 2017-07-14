'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var namespace = exports.namespace = function namespace(actionType) {
  return 'nion/' + actionType;
};

var UPDATE_ENTITY = exports.UPDATE_ENTITY = Symbol(namespace('UPDATE_ENTITY'));
var UPDATE_REF = exports.UPDATE_REF = Symbol(namespace('UPDATE_REF'));
var INITIALIZE_DATAKEY = exports.INITIALIZE_DATAKEY = Symbol(namespace('INITIALIZE_DATAKEY'));

var NION_API_REQUEST = exports.NION_API_REQUEST = Symbol(namespace('NION_API_REQUEST'));
var NION_API_SUCCESS = exports.NION_API_SUCCESS = Symbol(namespace('NION_API_SUCCESS'));
var NION_API_FAILURE = exports.NION_API_FAILURE = Symbol(namespace('NION_API_FAILURE'));
var NION_API_BOOTSTRAP = exports.NION_API_BOOTSTRAP = Symbol(namespace('NION_API_BOOTSTRAP'));