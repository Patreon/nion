import { ApiError } from 'redux-api-middleware'
import { camelizeKeys } from 'humps'
import devError from 'utilities/dev-error'
import access from 'safe-access'


/* inherits from https://github.com/agraboso/redux-api-middleware#apierror */

export class JsonApiError extends ApiError {
    constructor({ status, statusText, response }) {
        super(status, statusText, response)
        this.name = 'JsonApiError'
        this.jsonApiErrors = access(response, 'errors.map()', e => camelizeKeys(e)) || []
    }
}

export default (apiError) => {
    if (!(apiError instanceof ApiError)) {
        devError('transformApiError should only be called on api errors.')
    }

    return new JsonApiError(apiError)
}

export const APIError = ApiError
