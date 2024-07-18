import { applyMiddleware, createStore, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';

import { configureNion } from '../src';

// TODO (legacied import/no-default-export)
// This failure is legacied in and should be updated. DO NOT COPY.
// eslint-disable-next-line import/no-default-export
export default function configureTestStore() {
  const { reducer: nionReducer } = configureNion();

  const reducers = combineReducers({
    nion: nionReducer,
  });

  let store = createStore(reducers, applyMiddleware(thunkMiddleware));

  return store;
}
