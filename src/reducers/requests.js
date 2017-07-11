import get from 'lodash.get'

import {
    NION_API_REQUEST,
    NION_API_SUCCESS,
    NION_API_FAILURE,
} from '../actions/types'

const initialState = {}

const requestsReducer = (state = initialState, action) => {
    const existing = get(state, 'action.meta.dataKey')

    switch (action.type) {
        case NION_API_REQUEST:
            return {
                ...state,
                [action.meta.dataKey]: {
                    ...existing,
                    status: 'pending',
                    isLoading: true,
                    pending: action.meta.method,
                },
            }
        case NION_API_SUCCESS:
            return {
                ...state,
                [action.meta.dataKey]: {
                    ...existing,
                    status: 'success',
                    fetchedAt: Date.now(),
                    isError: false,
                    isLoaded: true,
                    isLoading: false,
                },
            }
        case NION_API_FAILURE:
            return {
                ...state,
                [action.meta.dataKey]: {
                    ...existing,
                    status: 'error',
                    name: action.payload.name,
                    errors: action.payload.errors,
                    fetchedAt: Date.now(),
                    isError: true,
                    isLoaded: false,
                    isLoading: false,
                    pending: undefined,
                },
            }
        default:
            return state
    }
}

export default requestsReducer
