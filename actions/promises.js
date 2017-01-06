// Important! We need to rely on a predictable promise API to tell how to handle errors
// in the API middleware - we need to know whether or not to reject the promises that are
// tied to the request lifecycle
import Promise from 'promise-polyfill'
import { selectApi } from './index'
import { selectData } from '../selectors'

// Create an "inside out" promise (with resolve and reject exposed) in order to pass down to the API
// middleware, such that each action (get, post, etc) returns a promise that is resolved or rejected
// inside the middleware when the API request succeeds or fails. This promise is resolved with the
// result of selectData(dataKey)
function makePromiseHandler(dataKey) {
    const promiseHandler = {}
    const promise = new Promise((resolve, reject) => {
        promiseHandler.resolve = () => {
            const state = promiseHandler.getState()
            const selected = selectData(dataKey)(state)
            resolve(selected)
        }
        promiseHandler.reject = reject
    })

    // We'll want to check if any pending promises have been attached to this promise
    // Before resolving / rejecting upon API success / failure
    promiseHandler.promise = promise
    return promiseHandler
}

const getAction = (dataKey, { endpoint, requestType }) => (dispatch) => {
    const promiseHandler = makePromiseHandler(dataKey)
    dispatch((_dispatch, getState) => {
        promiseHandler.getState = getState
        _dispatch(selectApi(requestType).get(dataKey, {
            endpoint
        }, promiseHandler))
    })
    return promiseHandler.promise
}

const patchAction = (dataKey, { endpoint, body, requestType }) => (dispatch) => {
    const promiseHandler = makePromiseHandler(dataKey)
    dispatch((_dispatch, getState) => {
        promiseHandler.getState = getState
        _dispatch(selectApi(requestType).patch(dataKey, {
            endpoint,
            body
        }, promiseHandler))
    })
    return promiseHandler.promise
}

const postAction = (dataKey, { endpoint, body, requestType }) => (dispatch) => {
    const promiseHandler = makePromiseHandler(dataKey)
    dispatch((_dispatch, getState) => {
        promiseHandler.getState = getState
        _dispatch(selectApi(requestType).post(dataKey, {
            endpoint,
            body
        }, promiseHandler))
    })
    return promiseHandler.promise
}

const deleteAction = (dataKey, ref, { endpoint, requestType }) => (dispatch) => {
    const promiseHandler = makePromiseHandler(dataKey)
    dispatch((_dispatch, getState) => {
        promiseHandler.getState = getState
        _dispatch(selectApi(requestType).delete(dataKey, ref, {
            endpoint
        }, promiseHandler))
    })
    return promiseHandler.promise
}

const nextAction = (dataKey, { endpoint, requestType }) => (dispatch) => {
    const promiseHandler = makePromiseHandler(dataKey)
    dispatch((_dispatch, getState) => {
        promiseHandler.getState = getState
        _dispatch(selectApi(requestType).get(dataKey, {
            endpoint,
            meta: {
                isNextPage: true
            }
        }, promiseHandler))
    })
    return promiseHandler.promise
}

export default {
    get: getAction,
    patch: patchAction,
    post: postAction,
    delete: deleteAction,
    next: nextAction
}
