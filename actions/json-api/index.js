import { CALL_API, getJSON } from 'redux-api-middleware'
import parseJsonApiResponse from './parse-json-api-response'
import { PatreonApiError } from 'utilities/extend-api-error'
import get from 'lodash.get'

import {
    JSON_API_REQUEST,
    JSON_API_SUCCESS,
    JSON_API_FAILURE,
    JSON_API_BOOTSTRAP
} from '../types'

const getJsonApiRequestTypes = (dataKey, meta = {}, promiseHandler) => {
    return [{
        type: JSON_API_REQUEST,
        meta: { dataKey, ...meta }
    }, {
        type: JSON_API_SUCCESS,
        meta: { dataKey, ...meta },
        payload: (action, state, res) => {
            return getJSON(res).then((json) => {
                // Resolve the passed in promise, if supplied
                if (get(promiseHandler, 'promise._deferreds.length')) {
                    // We need to ensure that the promise resolves AFTER the redux store has been
                    // updated, so pass it off to the next tick
                    const shouldResolve = promiseHandler && promiseHandler.resolve
                    shouldResolve && setImmediate(() => promiseHandler.resolve())
                }

                return json && parseJsonApiResponse(json, meta)
            })
        }
    }, {
        type: JSON_API_FAILURE,
        meta: { dataKey, ...meta },
        payload: (action, state, res) => {
            // Mannually handle the error here, rather than passing off to error middleware
            const error = new PatreonApiError(res)

            // Reject the passed in promise, if supplied. Note we only want to reject the promise if
            // it's being used, ie, there exist _deferred methods (promise-polyfill specific) field.
            // This is to avoid uncaught exceptions being raised in addition to the error being
            // raised in middleware
            if (get(promiseHandler, 'promise._deferreds.length')) {
                promiseHandler && promiseHandler.reject && promiseHandler.reject(error)
            }
            return error
        }
    }]
}

export const requestJsonApi = (dataKey, request, meta, promiseHandler) => {
    return {
        [CALL_API]: {
            types: getJsonApiRequestTypes(dataKey, meta, promiseHandler),
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
    }, { ...meta, method, endpoint }, promiseHandler)
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
        type: JSON_API_BOOTSTRAP,
        meta: { dataKey },
        payload: parseJsonApiResponse(data)
    }
}
