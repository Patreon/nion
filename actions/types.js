export const namespace = (actionType) => `nion/${actionType}`

export const UPDATE_ENTITY = namespace('UPDATE_ENTITY')
export const UPDATE_REF = namespace('UPDATE_REF')
export const INITIALIZE_DATAKEY = namespace('INITIALIZE_DATAKEY')

export const NION_API_REQUEST = namespace('NION_API_REQUEST')
export const NION_API_SUCCESS = namespace('NION_API_SUCCESS')
export const NION_API_FAILURE = namespace('NION_API_FAILURE')
export const NION_API_BOOTSTRAP = namespace('NION_API_BOOTSTRAP')

export const JSON_API = 'jsonApi'
export const API = 'api'
