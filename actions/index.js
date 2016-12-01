import {
    bootstrapJsonApi,
    deleteJsonApi,
    getJsonApi,
    getNextJsonApi,
    patchJsonApi,
    postJsonApi,
    requestJsonApi,
    urlBuilder
} from './json-api'

export const jsonApi = {
    bootstrap: bootstrapJsonApi,
    delete: deleteJsonApi,
    get: getJsonApi,
    next: getNextJsonApi,
    patch: patchJsonApi,
    post: postJsonApi,
    request: requestJsonApi,
    urlBuilder
}
