import { CALL_API } from 'redux-api-middleware'
import parseApiResponse from './parse-api-response'
import getRequestTypes from '../request-types'

import {
    GENERIC_BOOTSTRAP
} from '../types'

export const requestApi = (dataKey, request, meta, promiseHandler, dataParser) => {
    return {
        [CALL_API]: {
            types: getRequestTypes(dataKey, meta, promiseHandler, dataParser),
            headers: { 'Content-Type': 'application/json' },
            ...request
        }
    }
}

const fetchApi = (method) => (dataKey, { endpoint, body, meta }, promiseHandler) => {
    return requestApi(dataKey, {
        body: JSON.stringify(body),
        endpoint,
        method
    }, { ...meta, method, endpoint }, promiseHandler, parseApiResponse)
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

export const bootstrapGeneric = ({ dataKey, data }) => {
    return {
        type: GENERIC_BOOTSTRAP,
        meta: { dataKey },
        payload: data
    }
}
