import {
    bootstrapJsonApi,
    deleteJsonApi,
    getJsonApi,
    getNextJsonApi,
    patchJsonApi,
    postJsonApi,
    requestJsonApi
} from './json-api'

import {
    bootstrapGeneric,
    deleteApi,
    getApi,
    patchApi,
    postApi,
    requestApi
} from './api'

export const jsonApi = {
    bootstrap: bootstrapJsonApi,
    delete: deleteJsonApi,
    get: getJsonApi,
    next: getNextJsonApi,
    patch: patchJsonApi,
    post: postJsonApi,
    request: requestJsonApi
}

export const api = {
    bootstrap: bootstrapGeneric,
    delete: deleteApi,
    get: getApi,
    patch: patchApi,
    post: postApi,
    request: requestApi
}

const apiMap = {
    api: api,
    jsonApi: jsonApi
}

export const selectApi = (requestType) => {
    if (apiMap.hasOwnProperty(requestType)) {
        return apiMap[requestType]
    }
    throw new Error(`Request type ${requestType} is not supported by nion, using 'api'.`)
    return apiMap('api')
}
