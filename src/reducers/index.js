import { combineReducers } from 'redux';

import references from './references';
import requests from './requests';
import entities from './entities';

import { DenormalizationCache } from '../denormalize/cache';

function denormalizationCacheReducer(state) {
  if (!state) {
    return new DenormalizationCache();
  }
  return state;
}

// TODO (legacied import/no-default-export)
// This failure is legacied in and should be updated. DO NOT COPY.
// eslint-disable-next-line import/no-default-export
export default combineReducers({
  __dCache: denormalizationCacheReducer,
  references,
  requests,
  entities,
});
