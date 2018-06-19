import { applyMiddleware, createStore, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'

import { polling, jsonApiPagination } from '../src/extensions/manifest'

import { configureNion } from '../src'

export default function configureTestStore() {
    const { reducer: nionReducer } = configureNion({
        extensions: {
            polling,
            jsonApiPagination,
        },
    })

    const reducers = combineReducers({
        nion: nionReducer,
    })

    let store = createStore(reducers, applyMiddleware(thunkMiddleware))

    return store
}
