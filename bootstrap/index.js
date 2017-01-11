import get from 'lodash.get'
import map from 'lodash.map'
import { selectApi } from '../actions/apis'
import { isJsonApiResponse } from '../actions/json-api/parse-json-api-response'

const clone = (input) => JSON.parse(JSON.stringify(input))

const bootstrap = (store) => {
    const bootstrapObj = get(window, 'patreon.bootstrap', {})
    // Iterate over the bootstrap object with format { [dataKey]: <data> }
    map(bootstrapObj, (data, dataKey) => {
        // Only dispatch data that is JSON-API compliant using the jsonApi action creators
        const clonedData = clone(data)
        if (data && isJsonApiResponse(data)) {
            store.dispatch(selectApi('jsonApi').bootstrap({ dataKey, data: clonedData }))
        } else {
            store.dispatch(selectApi('api').bootstrap({ dataKey, data: clonedData }))
        }
    })
}

export default bootstrap
