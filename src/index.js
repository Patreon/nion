import decorator, * as decoratorHelpers from './decorator'
import * as selectors from './selectors'
import * as transforms from './transforms'
import configureNion from './configure'

// We'll be setting up a default API module (api)
import apiNionModule from './nion-modules/api'

configureNion({
    apiModules: {
        api: apiNionModule,
    },
    defaultApi: 'api',
})

export const { exists } = decoratorHelpers
export const { selectData, selectRequest, selectResourcesForKeys } = selectors
export const { makeRef } = transforms

export { default as actions } from './actions'
export { default as configureNion } from './configure'
export { default as bootstrapNion } from './bootstrap'
export { default as initializeNionDevTool } from './devtool'
export { buildUrl, urlBuilder } from './url'
export { apiNionModule } from './nion-modules'

export default decorator
