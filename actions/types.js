export const namespace = (actionType) => `nion/${actionType}`

export const UPDATE_ENTITY = namespace('UPDATE_ENTITY')
export const UPDATE_REF = namespace('UPDATE_REF')
export const INITIALIZE_DATAKEY = namespace('INITIALIZE_DATAKEY')

export const JSON_API_REQUEST = namespace('JSON_API_REQUEST')
export const JSON_API_SUCCESS = namespace('JSON_API_SUCCESS')
export const JSON_API_FAILURE = namespace('JSON_API_FAILURE')
export const JSON_API_BOOTSTRAP = namespace('JSON_API_BOOTSTRAP')

export const API_REQUEST = namespace('API_REQUEST')
export const API_SUCCESS = namespace('API_SUCCESS')
export const API_FAILURE = namespace('API_FAILURE')
export const GENERIC_BOOTSTRAP = namespace('GENERIC_BOOTSTRAP')

export const NION_API_REQUEST = namespace('NION_API_REQUEST')
export const NION_API_SUCCESS = namespace('NION_API_SUCCESS')
export const NION_API_FAILURE = namespace('NION_API_FAILURE')
export const NION_API_BOOTSTRAP = namespace('NION_API_BOOTSTRAP')
