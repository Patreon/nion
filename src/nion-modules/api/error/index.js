import map from 'lodash.map'
import { camelizeKeys } from 'humps'

export default class JsonApiError extends Error {
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
