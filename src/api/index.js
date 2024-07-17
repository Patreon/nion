import map from 'lodash/map';
import * as includedApiModules from '../api-modules';

const DEFAULT_API_TYPE = 'jsonApi';

// The singleton class that will manage all of nion's API modules. API modules handle URL building,
// request generation, and response parsing, supplying correctly formed action/payloads to the nion
// core reducers.
export class ApiManager {
  apiMap = {};
  defaultApiType = null;
  apiOptions = {
    isClient: true,
  };

  constructor() {
    map(includedApiModules, (module, key) => {
      this.registerApi(key, module);
    });
    this.setDefaultApi(DEFAULT_API_TYPE);
  }

  getApiModule = (apiType) => {
    if (this.apiMap[apiType]) {
      return this.apiMap[apiType];
    } else if (!apiType) {
      return this.apiMap[this.getDefaultApi()];
    }
    throw new Error(
      `API type ${apiType} is not registered with nion. Add a corresponding apiModule to nion.configureNion`,
    );
  };

  getRequestParameters = (apiType, method, options) => {
    return this.getApiModule(apiType).request.getRequestParameters(method, options);
  };

  getRequestHooks = (apiType) => {
    const { afterRequest, beforeRequest } = this.getApiModule(apiType).request;
    return {
      afterRequest: afterRequest ? afterRequest : () => Promise.resolve(),
      beforeRequest: beforeRequest ? beforeRequest : () => Promise.resolve(),
    };
  };

  getBuildUrl = (apiType) => {
    return this.getApiModule(apiType).buildUrl;
  };

  getErrorClass = (apiType) => {
    return this.getApiModule(apiType).ErrorClass;
  };

  getParser = (apiType) => {
    return this.getApiModule(apiType).parser;
  };

  getDefaultApi = () => {
    return this.defaultApiType;
  };

  registerApi = (name, api) => {
    // TODO: perhaps add some sort of run-time module interface checking here?
    this.apiMap[name] = api;
  };

  setDefaultApi = (name) => {
    if (name) {
      this.defaultApiType = name;
    } else {
      this.defaultApiType = Object.keys(this.apiMap)[0];
    }
  };

  getApiOptions = () => {
    return this.apiOptions;
  };

  setApiOptions = (options) => {
    this.apiOptions = options;
  };
}

export default new ApiManager();
