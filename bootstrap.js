import get from 'lodash.get'
import map from 'lodash.map'
import { jsonApi } from './actions/index'

const bootstrap = (store, toBootstrap) => {
    const bootstrapObj = get(window, 'patreon.bootstrap', {})

    // Iterate over the toBootstrap object with format { [ref]: <bootstrapKey> }
    map(toBootstrap, (bootstrapKey, dataKey) => {
        const data = bootstrapObj[bootstrapKey]
        store.dispatch(jsonApi.bootstrap({ dataKey, data }))
    })
}

export default bootstrap
