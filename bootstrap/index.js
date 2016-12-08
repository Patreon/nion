import get from 'lodash.get'
import map from 'lodash.map'
import { jsonApi, generic } from '../actions/index'

import { isJsonApiResponse } from '../actions/json-api/parse-json-api-response'

const bootstrap = (store) => {
    const bootstrapObj = get(window, 'patreon.bootstrap', {})

    // Iterate over the bootstrap object with format { [dataKey]: <data> }
    map(bootstrapObj, (data, dataKey) => {

        // Only dispatch data that is JSON-API compliant using the jsonApi action creators
        if (isJsonApiResponse(data)) {
            store.dispatch(jsonApi.bootstrap({ dataKey, data }))
        } else {
            store.dispatch(generic.bootstrap({ dataKey, data }))
        }
    })
}

export default bootstrap
