import { CALL_API } from 'redux-api-middleware'
import parseApiResponse from './parse-api-response'
import getRequestTypes from '../request-types'
import {
    NION_API_BOOTSTRAP,
    API
} from '../types'

export const requestApi = (dataKey, request, meta, promiseHandler, requestType, dataParser) => {
    return {
        [CALL_API]: {
            types: getRequestTypes(dataKey, meta, promiseHandler, requestType, dataParser),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, application/xml, text/plain, text/html, *.*'
            },
            ...request
        }
    }
}

const fetchApi = (method) => (dataKey, { endpoint, body, meta }, promiseHandler) => {
    return requestApi(dataKey, {
        body: JSON.stringify(body),
        endpoint,
        method
    }, { ...meta, method, endpoint }, promiseHandler, API, parseApiResponse)
}

export const getApi = fetchApi('GET')
export const postApi = fetchApi('POST')
export const patchApi = fetchApi('PATCH')

export const deleteApi = (dataKey, ref, options, promiseHandler) => {
    return fetchApi('DELETE')(dataKey, {
        ...options,
        meta: {
            ...options.meta,
            refToDelete: ref
        }
    }, promiseHandler)
}

export const bootstrapApi = ({ dataKey, data }) => {
    return {
        type: NION_API_BOOTSTRAP,
        meta: { dataKey },
        payload: {
            requestType: API,
            responseData: parseApiResponse(data)
        }
    }
}
