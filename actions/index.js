import {
    requestJsonApi,
    getJsonApi,
    postJsonApi,
    patchJsonApi,
    deleteJsonApi
} from './json-api'

export const jsonApi = {
    request: requestJsonApi,
    get: getJsonApi,
    post: postJsonApi,
    patch: patchJsonApi,
    delete: deleteJsonApi
}
