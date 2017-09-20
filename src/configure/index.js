import reducers from '../reducers'
import ApiManager from '../api'

import map from 'lodash.map'

export default ({ apiModules, defaultApi } = {}) => {
    if (apiModules) {
        map(apiModules, (apiModule, name) => {
            ApiManager.registerApi(name, apiModule)
        })

        ApiManager.setDefaultApi(defaultApi)
    }

    return {
        reducer: reducers,
    }
}
