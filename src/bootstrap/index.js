import map from 'lodash/map';
import ApiManager from '../api';
import actions from '../actions';

const clone = (input) => JSON.parse(JSON.stringify(input));

const bootstrap = (store, bootstrapObj, apiType = ApiManager.getDefaultApi()) => {
  // Iterate over the bootstrap object with format { [dataKey]: <data> }
  map(bootstrapObj, (data, dataKey) => {
    // Only dispatch data that is JSON-API compliant using the jsonApi action creators
    const clonedData = clone(data);
    store.dispatch(actions.bootstrap({ apiType, dataKey, data: clonedData }));
  });
};

// TODO (legacied import/no-default-export)
// This failure is legacied in and should be updated. DO NOT COPY.
// eslint-disable-next-line import/no-default-export
export default bootstrap;
