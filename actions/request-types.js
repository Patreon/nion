import { getJSON } from 'redux-api-middleware'
import { PatreonApiError } from 'utilities/extend-api-error'
import get from 'lodash.get'

import {
    NION_API_REQUEST,
    NION_API_SUCCESS,
    NION_API_FAILURE
} from './types'

const getRequestTypes = (dataKey, meta = {}, promiseHandler, requestType, dataParser) => {
    return [{
        type: NION_API_REQUEST,
        meta: { dataKey, ...meta }
    }, {
        type: NION_API_SUCCESS,
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

                return {
                    requestType: requestType,
                    responseData: dataParser(json)
                }
            })
        }
    }, {
        type: NION_API_FAILURE,
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

export default getRequestTypes
