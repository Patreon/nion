import Immutable from 'seamless-immutable'
import get from 'lodash.get'

import {
    NION_API_REQUEST,
    NION_API_SUCCESS,
    NION_API_FAILURE,
} from '../actions/types'

const initialState = Immutable({})

const requestsReducer = (state = initialState, action) => {
    const existing = get(state, 'action.meta.dataKey')

    switch (action.type) {
        case NION_API_REQUEST:
            return state.merge(
                {
                    [action.meta.dataKey]: {
                        ...existing,
                        status: 'pending',
                        isLoading: true,
                        pending: action.meta.method,
                    },
                },
                { deep: true },
            )
        case NION_API_SUCCESS:
            return state.merge(
                {
                    [action.meta.dataKey]: {
                        ...existing,
                        status: 'success',
                        fetchedAt: action.meta.fetchedAt,
                        isError: false,
                        isLoaded: true,
                        isLoading: false,
                    },
                },
                { deep: true },
            )
        case NION_API_FAILURE:
            return state.merge(
                {
                    [action.meta.dataKey]: {
                        ...existing,
                        status: 'error',
                        name: action.payload.name,
                        errors: action.payload.errors,
                        fetchedAt: action.meta.fetchedAt,
                        isError: true,
                        isLoaded: false,
                        isLoading: false,
                        pending: undefined,
                    },
                },
                { deep: true },
            )
        default:
            return state
    }
}

export default requestsReducer
