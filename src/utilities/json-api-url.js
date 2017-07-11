import urlFactory from 'url-factory'
import get from 'lodash.get'

// access standardize window object for location / server data
const defaults = {
    location: {
        hostname: 'www.localhost:3000',
        pathname: '',
    },
    apiServer: 'localhost:8080',
    webServer: 'localhost:3000',
}

export const CURRENT_JSON_API_VERSION = '1.0'
const DEFAULT_API_DOMAIN = 'localhost:8080'
const DEFAULT_WWW_DOMAIN = 'localhost:3000'

let apiDomain =
    get(defaults, 'apiServer', DEFAULT_API_DOMAIN)
if (apiDomain.startsWith('http')) {
    apiDomain = apiDomain.slice(apiDomain.indexOf('://') + 3)
}
export const apiHost = `https://${apiDomain}`

export default urlFactory(apiHost, {
    'json-api-version': CURRENT_JSON_API_VERSION,
})

export const urlBuilderForDefaults = defaults =>
    urlFactory(apiHost, {
        'json-api-version': CURRENT_JSON_API_VERSION,
        ...defaults,
    })

const wwwDomain =
    get(defaults, 'location.hostname', DEFAULT_WWW_DOMAIN)
export const wwwURL = urlFactory(`https://${wwwDomain}`)
