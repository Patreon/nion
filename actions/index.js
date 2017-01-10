import { registerApi } from './apis'
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

registerApi('jsonApi', jsonApi)
registerApi('api', api)
