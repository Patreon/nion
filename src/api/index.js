import defaultApi from '../modules/default'
const DEFAULT_API_TYPE = 'default'

// The singleton class that will manage all of nion's API modules. API modules handle URL building,
// request generation, and response parsing, supplying correctly formed action/payloads to the nion
// core reducers.
const noop = () => {}

class ApiManager {
    apiMap = {}
    defaultApiType = null

    constructor() {
        this.registerApi(DEFAULT_API_TYPE, defaultApi)
        this.setDefaultApi(DEFAULT_API_TYPE)
    }

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
        return this.getApiModule(apiType).buildUrl
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
    }

    setDefaultApi = name => {
        if (name) {
            this.defaultApiType = name
        } else {
            this.defaultApiType = Object.keys(this.apiMap)[0]
        }
    }
}

export default new ApiManager()
