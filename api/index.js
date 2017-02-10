// The singleton class that will manage all of nion's API modules. API modules handle URL building,
// request generation, and response parsing, supplying correctly formed action/payloads to the nion
// core reducers.
import { buildUrl } from '../url'

class ApiManager {
    apiMap = {}
    defaultApiType = null

    getApiModule = (apiType) => {
        if (this.apiMap[apiType]) {
            return this.apiMap[apiType]
        } else if (!apiType) {
            return this.apiMap[this.getDefaultApi()]
        }
        throw new Error(`API type ${apiType} is not registered with nion. Add a corresponding apiModule to nion.configureNion`)
    }

    getRequestParameters = (apiType, method, options) => {
        return this.getApiModule(apiType).request(method, options)
    }

    getBuildUrl = (apiType) => {
        return this.getApiModule(apiType).buildUrl
    }

    getErrorClass = (apiType) => {
        return this.getApiModule(apiType).ErrorClass
    }

    getParser = (apiType) => {
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

    setDefaultApi = (name) => {
        if (name) {
            this.defaultApiType = name
        } else {
            this.defaultApiType = Object.keys(this.apiMap)[0]
        }
    }

}

export default new ApiManager()
