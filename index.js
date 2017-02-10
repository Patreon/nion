import decorator, * as decoratorHelpers from './decorator'
import * as selectors from './selectors'
import * as actions from './actions'
import * as transforms from './transforms'
import configureNion from './configure'

// We'll be setting up a default API module (json-api)
import jsonApiNionModule from '../nion-modules/json-api'

configureNion({
    apiModules: {
        jsonApi: jsonApiNionModule
    },
    defaultApi: 'jsonApi'
})

export const { exists } = decoratorHelpers
export const { selectData, selectRequest, selectResourcesForKeys } = selectors
export const { jsonApi } = actions
export const { makeRef } = transforms

export { default as configureNion } from './configure'
export { default as bootstrapNion } from './bootstrap'
export { default as initializeNionDevTool } from './devtool'
export { buildUrl, urlBuilder } from './url'

export default decorator
