import {
    urlBuilder,
    requestJsonApi,
    getJsonApi,
    postJsonApi,
    patchJsonApi,
    deleteJsonApi
} from './json-api'

export const jsonApi = {
    urlBuilder,
    request: requestJsonApi,
    get: getJsonApi,
    post: postJsonApi,
    patch: patchJsonApi,
    delete: deleteJsonApi
}
