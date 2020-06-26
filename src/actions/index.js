import fetch from 'isomorphic-fetch'
import ApiManager from '../api'
import {
    NION_API_REQUEST,
    NION_API_SUCCESS,
    NION_API_FAILURE,
    NION_API_BOOTSTRAP,
    UPDATE_ENTITY,
} from './types'
import { selectData } from '../selectors'
import Lifecycle from '../lifecycle'

const apiAction = (method, dataKey, options) => _dispatch => {
    const { body, declaration = {}, endpoint } = options

    const meta = {
        ...options.meta,
        dataKey,
        endpoint,
        method,
        isProcessing: true,
    }

    const { apiType = ApiManager.getDefaultApi() } = declaration
    const parse = ApiManager.getParser(apiType)
    const ErrorClass = ApiManager.getErrorClass(apiType)

    // Return our async / thunk API call manager
    return _dispatch(async (dispatch, getState) => {
        await dispatch({
            type: NION_API_REQUEST,
            meta,
        })

        try {
            const requestParams = await ApiManager.getRequestParameters(
                apiType,
                method,
                options,
            )

            Lifecycle.onRequest({
                method,
                dataKey,
                requestParams,
                meta,
                declaration,
            })

            // Add the request body if present
            if (body) {
                requestParams.body = JSON.stringify(body)
            }

            const response = await fetch(endpoint, {
                method,
                ...requestParams,
                ...declaration.requestParams,
            })

            Lifecycle.onSuccess({
                method,
                dataKey,
                requestParams,
                response,
                meta,
                declaration,
            })

            // Handle the case that calling response.json() on null responses throws a syntax error
            const text = await response.text()
            const json = text ? JSON.parse(text) : {}

            // Handle any request errors since fetch doesn't throw
            if (!response.ok) {
                const { status, statusText } = response
                throw new ErrorClass(status, statusText, {
                    ...response,
                    ...json,
                })
            }

            await dispatch({
                type: NION_API_SUCCESS,
                meta: {
                    ...meta,
                    fetchedAt: Date.now(),
                    statusCode: response.status,
                    isProcessing: response.status === 202 ? true : false,
                },
                payload: {
                    requestType: apiType,
                    responseData: parse(json),
                },
            })

            return selectData(dataKey)(getState())
        } catch (error) {
            Lifecycle.onFailure({ method, dataKey, error, meta, declaration })
            try {
                await dispatch({
                    type: NION_API_FAILURE,
                    meta: {
                        ...meta,
                        fetchedAt: Date.now(),
                        statusCode: error.status,
                        isProcessing: false,
                    },
                    payload: error,
                })
            } catch (renderError) {
                // We probably want to catch any render errors here, logging them but actually
                // throwing the api error that caused it
                console.error(renderError)
            }
            throw error
        }
    })
}

const getAction = (dataKey, options) => {
    return apiAction('GET', dataKey, options)
}

const postAction = (dataKey, options) => {
    return apiAction('POST', dataKey, options)
}

const putAction = (dataKey, options) => {
    return apiAction('PUT', dataKey, options)
}

const patchAction = (dataKey, options) => {
    return apiAction('PATCH', dataKey, options)
}

const deleteAction = (dataKey, options) => {
    return apiAction('DELETE', dataKey, {
        ...options,
        meta: {
            ...options.meta,
            refToDelete: options.refToDelete,
        },
    })
}

/**
 * @deprecated
 */
const bootstrapAction = ({ apiType, dataKey, data }) => {
    const parse = ApiManager.getParser(apiType)
    return {
        type: NION_API_BOOTSTRAP,
        meta: { dataKey },
        payload: {
            apiType,
            responseData: parse(data),
        },
    }
}

/**
 * @deprecated Will be renamed
 */
const updateEntityAction = ({ type, id }, attributes) => {
    return {
        type: UPDATE_ENTITY,
        payload: { type, id, attributes },
    }
}

export const get = getAction

export const post = postAction
export const patch = patchAction
export { deleteAction as delete }
export const bootstrap = bootstrapAction
export const updateEntity = updateEntityAction

export default {
    get,
    post,
    patch,
    delete: deleteAction,
    bootstrap,
    updateEntity,
}
