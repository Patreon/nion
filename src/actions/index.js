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

const apiAction = (method, dataKey, options) => _dispatch => {
    const { body, declaration = {}, endpoint } = options

    const meta = {
        ...options.meta,
        dataKey,
        endpoint,
        method,
    }

    const { apiType } = declaration

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

            // Add the request body if present
            if (body) {
                requestParams.body = JSON.stringify(body)
            }

            const response = await fetch(endpoint, {
                method,
                ...requestParams,
                ...declaration.requestParams,
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
                meta,
                payload: {
                    requestType: apiType,
                    responseData: parse(json),
                },
            })

            return selectData(dataKey)(getState())
        } catch (error) {
            await dispatch({
                type: NION_API_FAILURE,
                meta,
                payload: error,
            })

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

const nextAction = (dataKey, options) => {
    return apiAction('GET', dataKey, {
        ...options,
        meta: {
            ...options.meta,
            isNextPage: true,
        },
    })
}

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

const updateEntityAction = ({ type, id }, attributes) => {
    return {
        type: UPDATE_ENTITY,
        payload: { type, id, attributes },
    }
}

export default {
    get: getAction,
    post: postAction,
    patch: patchAction,
    delete: deleteAction,
    next: nextAction,
    bootstrap: bootstrapAction,
    updateEntity: updateEntityAction,
}
