import urlFactory from 'url-factory'
import get from 'lodash.get'

// eventually make this configurable via nion api-module config interface
const CURRENT_JSON_API_VERSION = '1.0'

export const urlBuilderForDefaults = (apiHost, defaults) =>
    urlFactory(apiHost, {
        'json-api-version': CURRENT_JSON_API_VERSION,
        ...defaults,
    })

export default apiHost => {
    return urlBuilderForDefaults(apiHost, { include: [] })
}
