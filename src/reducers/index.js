import { combineReducers } from 'redux';

import references from './references';
import requests from './requests';
import entities from './entities';

// TODO (legacied import/no-default-export)
// This failure is legacied in and should be updated. DO NOT COPY.
// eslint-disable-next-line import/no-default-export
export default combineReducers({
  references,
  requests,
  entities,
});
