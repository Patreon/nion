import map from 'lodash.map'
import { camelizeKeys } from 'humps'

// A default error class for handling nion api errors
export default class NionApiError extends Error {
    constructor(status, statusText, response) {
        super()
        this.name = 'ApiError'
        this.status = status
        this.statusText = statusText
        this.response = response
        this.message = `${status} - ${statusText}`
        this.errors = map(response.errors, e => camelizeKeys(e))
    }
}
