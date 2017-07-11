import get from 'lodash.get'

import buildUrl from './build-url'
import ErrorClass from './error'
import parser from './parser'
import * as pagination from './pagination'
import * as request from './request'

export const isJsonApi = object => {
    return !!get(object, 'data')
}

export const JsonApiPayload = request.JsonApiPayload

export default {
    buildUrl,
    isJsonApi,
    ErrorClass,
    pagination,
    parser,
    request,
}
