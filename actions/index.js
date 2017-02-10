import { CALL_API } from 'redux-api-middleware'
import { NION_API_BOOTSTRAP } from './types'
import getRequestTypes from './request-types'
import ApiManager from '../api'

// Create the redux standard API action
const apiRequest = (dataKey, requestObj, meta, promiseHandler, apiType) => {
    return {
        [CALL_API]: {
            types: getRequestTypes(dataKey, meta, promiseHandler, apiType),
            ...requestObj
        }
    }
}

const makeMethod = (method) => (dataKey, options, promiseHandler) => {
    const { endpoint, body, meta, declaration } = options
    const nextMeta = { ...meta, method, endpoint }
    const { apiType } = declaration

    const requestParams = {
        ...ApiManager.getRequestParameters(apiType, method, options),
        ...declaration.requestParams
    }

    return apiRequest(dataKey, {
        ...requestParams,
        body: JSON.stringify(body),
        endpoint,
        method
    }, nextMeta, promiseHandler, apiType)
}

const apiGet = makeMethod('GET')
const apiPost = makeMethod('POST')
const apiPatch = makeMethod('PATCH')

const apiDelete = (dataKey, ref, options, promiseHandler) => {
    return makeMethod('DELETE')(dataKey, {
        ...options,
        meta: {
            ...options.meta,
            refToDelete: ref
        }
    }, promiseHandler)
}

const bootstrap = ({ apiType, dataKey, data }) => {
    const parse = ApiManager.getParser(apiType)
    return {
        type: NION_API_BOOTSTRAP,
        meta: { dataKey },
        payload: {
            apiType,
            responseData: parse(data)
        }
    }
}

export default {
    get: apiGet,
    post: apiPost,
    patch: apiPatch,
    delete: apiDelete,
    request: apiRequest,
    bootstrap
}
