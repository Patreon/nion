import reducers from '../reducers'
import ApiManager from '../api'

import map from 'lodash.map'

export default ({ apiModules = {}, defaultApi, csrfProvider }) => {
    if (Object.keys(apiModules).length === 0) {
        throw new Error(
            'nion requires at least one API module. Please supply an API module in nion.configureNion',
        )
    }

    map(apiModules, (apiModule, name) => {
        ApiManager.registerApi(name, apiModule)
    })

    ApiManager.setDefaultApi(defaultApi)

    if (csrfProvider) {
        ApiManager.setCsrfProvider(csrfProvider)
    }

    return {
        reducer: reducers,
    }
}
