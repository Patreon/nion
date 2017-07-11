import url from 'fast-url-parser'
import queryString from 'qs'
url.queryString = queryString

import map from 'lodash.map'
import includes from 'lodash.includes'

import ApiManager from '../api'

export const buildUrl = (...args) => {
    const defaultApi = ApiManager.getDefaultApi()
    const defaultBuildUrl = ApiManager.getBuildUrl(defaultApi)
    return defaultBuildUrl(...args)
}

export const urlBuilder = (...args) => {
    const defaultApi = ApiManager.getDefaultApi()
    const defaultBuildUrl = ApiManager.getBuildUrl(defaultApi)
    return () => {
        defaultBuildUrl(...args)
    }
}

export const deconstructUrl = input => {
    const unescaped = decodeURI(input)
    const deconstructed = url.parse(unescaped, true)

    // Deal with the (silly) way arrays are handled
    // https://github.com/Patreon/url-factory/blob/master/src/index.js#L4
    map(deconstructed.query, (item, key) => {
        // Handle the string-encoded empty array
        if (item === '[]') {
            deconstructed.query[key] = []
            // Handle the fact that [ 'a', 'b' ] is encoded as "a,b"
        } else if (includes(item, ',')) {
            deconstructed.query[key] = item.split(',')
            // Handle the fact that [ 'a' ] is encoded as "a"
        } else if (key === 'include' && item.length) {
            deconstructed.query[key] = [item]
        }
    })

    return {
        ...deconstructed,
        options: deconstructed.query,
    }
}
