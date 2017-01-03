export const namespace = (actionType) => `nion/${actionType}`

export const UPDATE_ENTITY = namespace('UPDATE_ENTITY')
export const UPDATE_REF = namespace('UPDATE_REF')
export const INITIALIZE_DATAKEY = namespace('INITIALIZE_DATAKEY')

export const JSON_API_REQUEST = namespace('JSON_API_REQUEST')
export const JSON_API_SUCCESS = namespace('JSON_API_SUCCESS')
export const JSON_API_FAILURE = namespace('JSON_API_FAILURE')
export const JSON_API_BOOTSTRAP = namespace('JSON_API_BOOTSTRAP')

export const GENERIC_BOOTSTRAP = namespace('GENERIC_BOOTSTRAP')
export const GENERIC_API = namespace('GENERIC_API')
