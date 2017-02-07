// Set up a `buildUrl` function for dynamic hostnames and terser api path construction in nion
import { urlBuilderForDefaults } from 'utilities/json-api-url'
export const buildUrl = urlBuilderForDefaults({ include: [] })

// inject `buildUrl` as an option into the nion decorator
import decoratorWithoutBuildURL from 'libs/nion-os'

const decoratorWithBuildURL = (declarations = {}, options = {}) =>
    decoratorWithoutBuildURL(declarations, { buildUrl, ...options })

export default decoratorWithBuildURL

export * from 'libs/nion-os'
