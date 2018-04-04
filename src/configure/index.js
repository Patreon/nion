import reducers from '../reducers'
import ExtensionManager from '../extensions'
import ApiManager from '../api'

import map from 'lodash.map'

class Configuration {}

export const configuration = new Configuration()

export default (options = {}) => {
    const { apiModules, extensions, defaultApi } = options

    if (apiModules) {
        map(apiModules, (apiModule, name) => {
            ApiManager.registerApi(name, apiModule)
        })

        ApiManager.setDefaultApi(defaultApi)
    }

    if (extensions) {
        map(extensions, (extension, name) => {
            ExtensionManager.registerExtension(name, extension)
        })
    }

    return {
        reducer: reducers,
    }
}
