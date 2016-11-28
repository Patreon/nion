import { CALL_API, getJSON } from 'redux-api-middleware'
import jsonApiUrl from 'utilities/json-api-url'
import parseJsonApiResponse from './parse-json-api-response'

const JSON_API_REQUEST = 'JSON_API_REQUEST'
const JSON_API_SUCCESS = 'JSON_API_SUCCESS'
const JSON_API_FAILURE = 'JSON_API_FAILURE'

const getJsonApiRequestTypes = (dataKey) => {
    return [{
        type: JSON_API_REQUEST,
        meta: { dataKey }
    }, {
        type: JSON_API_SUCCESS,
        meta: { dataKey },
        payload: (action, state, res) => {
            return getJSON(res).then((json) => json && parseJsonApiResponse(json))
        }
    }, {
        type: JSON_API_FAILURE,
        meta: { dataKey }
    }]
}

export const requestJsonApi = (dataKey, request) => {
    return {
        [CALL_API]: {
            types: getJsonApiRequestTypes(dataKey),
            headers: { 'Content-Type': 'application/vnd.api+json' },
            ...request
        }
    }
}

const fetchJsonApi = (dataKey, resource, method, body) => {
    return requestJsonApi(dataKey, {
        credentials: 'include',
        body: JSON.stringify(body),
        endpoint: resource,
        method
    })
}

export const getJsonApi = (dataKey, { resource, includes, fields }) => {
    return fetchJsonApi(
        dataKey,
        jsonApiUrl(
            resource,
            {
                includes,
                fields
            }
        ),
        'GET'
    )
}

export const postJsonApi = (dataKey, { resource, includes, fields, body }) => {
    return fetchJsonApi(
        dataKey,
        jsonApiUrl(
            resource,
            {
                includes,
                fields
            }
        ),
        'POST',
        body
    )
}

export const patchJsonApi = (dataKey, { resource, endpoint, includes, fields, body }) => {
    return fetchJsonApi(
        dataKey,
        jsonApiUrl(
            resource,
            {
                includes,
                fields
            }
        ),
        'PATCH',
        body
    )
}

export const deleteJsonApi = (dataKey, { resource, includes, fields }) => {
    return fetchJsonApi(
        dataKey,
        jsonApiUrl(
            resource,
            {
                includes,
                fields
            }
        ),
        'DELETE'
    )
}
