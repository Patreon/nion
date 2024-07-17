export const namespace = (actionType) => `nion/${actionType}`;

export const UPDATE_ENTITY = Symbol(namespace('UPDATE_ENTITY'));
export const UPDATE_REF = Symbol(namespace('UPDATE_REF'));
export const INITIALIZE_DATAKEY = Symbol(namespace('INITIALIZE_DATAKEY'));

export const NION_API_REQUEST = Symbol(namespace('NION_API_REQUEST'));
export const NION_API_SUCCESS = Symbol(namespace('NION_API_SUCCESS'));
export const NION_API_FAILURE = Symbol(namespace('NION_API_FAILURE'));
export const NION_API_BOOTSTRAP = Symbol(namespace('NION_API_BOOTSTRAP'));
export const NION_API_NO_OPERATION = Symbol(namespace('NION_API_NO_OPERATION'));
