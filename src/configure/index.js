import reducers from '../reducers';
import ExtensionManager from '../extensions';
import ApiManager from '../api';

import map from 'lodash/map';

// TODO (legacied import/no-default-export)
// This failure is legacied in and should be updated. DO NOT COPY.
// eslint-disable-next-line import/no-default-export
export default (options = {}) => {
  const { apiModules, defaultApi, extensions, apiOptions } = options;

  if (apiModules) {
    map(apiModules, (apiModule, name) => {
      ApiManager.registerApi(name, apiModule);
    });

    ApiManager.setDefaultApi(defaultApi);
  }

  if (extensions) {
    map(extensions, (extension, name) => {
      ExtensionManager.registerExtension(name, extension);
    });
  }

  if (apiOptions) {
    ApiManager.setApiOptions(apiOptions);
  }

  return {
    reducer: reducers,
  };
};
