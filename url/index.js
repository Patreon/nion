import { urlBuilderForDefaults } from 'utilities/json-api-url'
import url from 'fast-url-parser'
import queryStringParser from 'querystringparser'
url.queryString = queryStringParser

export const buildUrl = urlBuilderForDefaults({ include: [] })

export const deconstructUrl = (input) => {
    const unescaped = unescape(input)
    const deconstructed = url.parse(unescaped, true)

    return {
        pathname: deconstructed.pathname,
        options: deconstructed.query
    }
}
