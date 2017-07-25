import get from 'lodash.get'

import { deconstructUrl } from '../../../url'
import ApiManager from '../../../api'

export const canLoadMore = data => {
    return !!get(data, 'links.next') && !get(data, 'request.isLoading')
}

export const getNextUrl = (declaration, selectedData) => {
    const nextUrl = processNextUrl(selectedData)

    if (!nextUrl) {
        return null
    }

    const buildUrl = ApiManager.getBuildUrl(declaration.apiType)

    /* We want to make sure we apply the parameters supplied in the declaration URL to the url
     * supplied via the pagination link. Most of the time, cartographer should respect our passed up
     * query parameters, but there are instances where it does not.
     * So here we take the query parameters from the api-returned nextUrl,
     * and union them with our existing endpoint.
     */

    /* Extracting only the piece of the nextUrl pathname needed to be provided to buildUrl is a little tricky,
     * but necessary for cases when the baseUrl that buildUrl is using has its own pathname portion.
     * Otherwise, the built url that this function returns will have a duplicated pathname portion,
     * e.g. https://example.com/api/api/posts
     * Our approach is to use `buildUrl('')` to find that baseUrl pathname,
     * and strip it from the beginning of the returned nextUrl pathname.
     */
    // Find buildUrl's baseUrl's pathname
    const rootApiUrl = buildUrl('')

    let rootApiPath = deconstructUrl(rootApiUrl).pathname
    // Slice off any trailing slashes
    if (rootApiPath.length > 1 && rootApiPath.endsWith('/')) {
        rootApiPath = rootApiPath.slice(0, rootApiPath.length - 1)
    }
    const { pathname, options: nextOptions } = deconstructUrl(nextUrl)
    // Strip the baseUrl's pathname off of the beginning of nextUrl's pathname
    const uniquePathPortion = pathname.replace(rootApiPath, '')
    const { options: declarationOptions } = deconstructUrl(declaration.endpoint)
    // nextOptions needs to override any duplicates with declarationOptions
    const newOptions = { ...declarationOptions, ...nextOptions }

    return buildUrl(uniquePathPortion, newOptions)
}

function processNextUrl(selectedData) {
    const nextUrl = get(selectedData, ['links', 'next'])

    if (!nextUrl) {
        return null
    }

    if (!startsWith('http://') && !startsWith('https://')) {
        return `https://${nextUrl}`
    } else {
        return nextUrl
    }

    function startsWith(value) {
        return nextUrl.indexOf(value) === 0
    }
}
