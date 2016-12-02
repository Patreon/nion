import { CALL_API, getJSON } from 'redux-api-middleware'
import { urlBuilderForDefaults } from 'utilities/json-api-url'
import parseJsonApiResponse from './parse-json-api-response'

const JSON_API_REQUEST = 'JSON_API_REQUEST'
const JSON_API_SUCCESS = 'JSON_API_SUCCESS'
const JSON_API_FAILURE = 'JSON_API_FAILURE'

const getJsonApiRequestTypes = (dataKey, meta = {}) => {
    return [{
        type: JSON_API_REQUEST,
        meta: { dataKey, ...meta }
    }, {
        type: JSON_API_SUCCESS,
        meta: { dataKey, ...meta },
        payload: (action, state, res) => {
            return getJSON(res).then((json) => json && parseJsonApiResponse(json, meta))
        }
    }, {
        type: JSON_API_FAILURE,
        meta: { dataKey, ...meta }
    }]
}

export const requestJsonApi = (dataKey, request, meta) => {
    return {
        [CALL_API]: {
            types: getJsonApiRequestTypes(dataKey, meta),
            headers: { 'Content-Type': 'application/vnd.api+json' },
            ...request
        }
    }
}

const fetchJsonApi = (method) => (dataKey, { endpoint, body, meta }) => {
    return requestJsonApi(dataKey, {
        credentials: 'include',
        body: JSON.stringify(body),
        endpoint,
        method
    }, { ...meta, method, endpoint })
}

export const getJsonApi = fetchJsonApi('GET')
export const postJsonApi = fetchJsonApi('POST')
export const patchJsonApi = fetchJsonApi('PATCH')

export const deleteJsonApi = (dataKey, ref, options) => {
    return fetchJsonApi('DELETE')(dataKey, {
        ...options,
        meta: {
            ...options.meta,
            refToDelete: ref
        }
    })
}

export const bootstrapJsonApi = ({ dataKey, data }) => {
    return {
        type: 'JSON_API_BOOTSTRAP',
        meta: { dataKey },
        payload: parseJsonApiResponse(data)
    }
}

export const urlBuilder = urlBuilderForDefaults({include: []})
