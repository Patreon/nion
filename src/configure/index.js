import reducers from '../reducers'
import ApiManager from '../api'

import map from 'lodash.map'

class Configuration {
    flattenSelectedData = false
}

export const configuration = new Configuration()

export default (options = {}) => {
    const { apiModules, defaultApi, flattenSelectedData } = options
    if (apiModules) {
        map(apiModules, (apiModule, name) => {
            ApiManager.registerApi(name, apiModule)
        })

        ApiManager.setDefaultApi(defaultApi)
    }

    if (flattenSelectedData !== undefined) {
        configuration.flattenSelectedData = flattenSelectedData
    }

    return {
        reducer: reducers,
    }
}
