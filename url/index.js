import url from 'fast-url-parser'
import queryStringParser from 'querystringparser'
url.queryString = queryStringParser

import ApiManager from '../api'

export const deconstructUrl = (input) => {
    const unescaped = unescape(input)
    const deconstructed = url.parse(unescaped, true)

    return {
        ...deconstructed,
        options: deconstructed.query
    }
}

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
