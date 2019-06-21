import get from 'lodash.get'
import omit from 'lodash.omit'

import ApiManager from '../api'
// Helper method to construct a url endpoint from supplied declaration and params.
// This will be used to build the endpoints for the various method actions
export function getUrl(declaration, params) {
    let endpoint = get(declaration, 'endpoint')
    const buildUrl = ApiManager.getBuildUrl(declaration.apiType)

    // If supplied endpoint override at call time, then use the supplied endpoint
    if (get(params, 'endpoint')) {
        endpoint = params.endpoint
        params = omit(params, ['endpoint'])
    }

    // Use if a fully-formed url, otherwise pass to buildUrl
    return typeof buildUrl === 'undefined' ||
        typeof endpoint === 'undefined' ||
        endpoint.indexOf('https://') === 0 ||
        endpoint.indexOf('http://') === 0
        ? endpoint
        : buildUrl(endpoint, params)
}
