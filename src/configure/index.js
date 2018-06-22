import reducers from '../reducers'
import ExtensionManager from '../extensions'
import ApiManager from '../api'
import Lifecycle from '../lifecycle'

import map from 'lodash.map'

class Configuration {}

export const configuration = new Configuration()

export default (options = {}) => {
    const { apiModules, extensions, defaultApi, lifecycle } = options

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

    if (lifecycle) {
        Lifecycle.registerMethods(lifecycle)
    }

    return {
        reducer: reducers,
    }
}
