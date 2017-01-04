import { CALL_API } from 'redux-api-middleware'
import parseJsonApiResponse from './parse-json-api-response'
import getRequestTypes from '../request-types'

import {
    NION_API_BOOTSTRAP
} from '../types'

export const requestJsonApi = (dataKey, request, meta, promiseHandler, dataParser) => {
    return {
        [CALL_API]: {
            types: getRequestTypes(dataKey, meta, promiseHandler, dataParser),
            headers: { 'Content-Type': 'application/vnd.api+json' },
            ...request
        }
    }
}

const fetchJsonApi = (method) => (dataKey, { endpoint, body, meta }, promiseHandler) => {
    return requestJsonApi(dataKey, {
        credentials: 'include',
        body: JSON.stringify(body),
        endpoint,
        method
    }, { ...meta, method, endpoint }, promiseHandler, parseJsonApiResponse)
}

export const getJsonApi = fetchJsonApi('GET')
export const postJsonApi = fetchJsonApi('POST')
export const patchJsonApi = fetchJsonApi('PATCH')

export const deleteJsonApi = (dataKey, ref, options, promiseHandler) => {
    return fetchJsonApi('DELETE')(dataKey, {
        ...options,
        meta: {
            ...options.meta,
            refToDelete: ref
        }
    }, promiseHandler)
}

export const bootstrapJsonApi = ({ dataKey, data }) => {
    return {
        type: NION_API_BOOTSTRAP,
        meta: { dataKey },
        payload: {
            requestType: 'jsonApi',
            responseData: parseJsonApiResponse(data)
        }
    }
}
