import { applyMiddleware, createStore, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';

import { configureNion } from '../src';

export default function configureTestStore() {
  const { reducer: nionReducer } = configureNion();

  const reducers = combineReducers({
    nion: nionReducer,
  });

  let store = createStore(reducers, applyMiddleware(thunkMiddleware));

  return store;
}
