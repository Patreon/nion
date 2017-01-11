import { registerApi } from './apis'
import { JSON_API, API } from './types'
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
    bootstrapApi,
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
    bootstrap: bootstrapApi,
    delete: deleteApi,
    get: getApi,
    patch: patchApi,
    post: postApi,
    request: requestApi
}

registerApi(JSON_API, jsonApi)
registerApi(API, api)
