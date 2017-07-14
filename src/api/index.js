// The singleton class that will manage all of nion's API modules. API modules handle URL building,
// request generation, and response parsing, supplying correctly formed action/payloads to the nion
// core reducers.
import { buildUrl } from '../url'
const noop = () => {}

class ApiManager {
    apiMap = {}
    defaultApiType = null
    defaultApiUrl = null
    csrfProvider = null

    getApiModule = apiType => {
        if (this.apiMap[apiType]) {
            return this.apiMap[apiType]
        } else if (!apiType) {
            return this.apiMap[this.getDefaultApi()]
        }
        throw new Error(
            `API type ${apiType} is not registered with nion. Add a corresponding apiModule to nion.configureNion`,
        )
    }

    getRequestParameters = (apiType, method, options) => {
        return this.getApiModule(apiType).request.getRequestParameters(
            method,
            options,
            this.csrfProvider,
        )
    }

    getRequestHooks = apiType => {
        const { afterRequest, beforeRequest } = this.getApiModule(
            apiType,
        ).request
        return {
            afterRequest: afterRequest ? afterRequest : () => Promise.resolve(),
            beforeRequest: beforeRequest
                ? beforeRequest
                : () => Promise.resolve(),
        }
    }

    getBuildUrl = apiType => {
        return this.getApiModule(apiType).buildUrl(this.defaultApiUrl)
    }

    getErrorClass = apiType => {
        return this.getApiModule(apiType).ErrorClass
    }

    getPagination = apiType => {
        return this.getApiModule(apiType).pagination || noop
    }

    getParser = apiType => {
        return this.getApiModule(apiType).parser
    }

    getDefaultApi = () => {
        return this.defaultApiType
    }

    registerApi = (name, api) => {
        this.apiMap[name] = api

        // Attach the namespaced buildUrl method to the exported buildUrl method (experimental)
        buildUrl[name] = api.buildUrl
    }

    setDefaultApi = name => {
        if (name) {
            this.defaultApiType = name
        } else {
            this.defaultApiType = Object.keys(this.apiMap)[0]
        }
    }

    setDefaultApiUrl = url => {
        this.defaultApiUrl = url
    }

    setCsrfProvider = csrfProvider => {
        if (csrfProvider) {
            this.csrfProvider = csrfProvider
        }
    }
}

export default new ApiManager()
