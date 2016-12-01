import get from 'lodash.get'

const initialState = {}

const requestsReducer = (state = initialState, action) => {
    const existing = get(state, 'action.meta.dataKey')

    if (action.error) {
        return {
            ...state,
            [action.meta.dataKey]: {
                ...existing,
                status: 'error',
                name: action.payload.name,
                errors: [action.payload.message],
                isError: true,
                isLoading: false,
                isLoaded: false,
                pending: undefined
            }
        }
    }

    switch (action.type) {
        case 'JSON_API_REQUEST':
            return {
                ...state,
                [action.meta.dataKey]: {
                    ...existing,
                    status: 'pending',
                    isLoading: true,
                    pending: action.meta.method
                }
            }
        case 'JSON_API_SUCCESS':

            return {
                ...state,
                [action.meta.dataKey]: {
                    ...existing,
                    status: 'success',
                    fetchedAt: Date.now(),
                    isError: false,
                    isLoaded: true,
                    isLoading: false
                }
            }
        case 'JSON_API_FAILURE':
            return {
                ...state,
                [action.meta.dataKey]: {
                    ...existing,
                    status: 'error',
                    name: 'PatreonApiError',
                    errors: get(action, 'errors') || [],
                    fetchedAt: Date.now(),
                    isError: true,
                    isLoading: false
                }
            }
        default:
            return state
    }
}

export default requestsReducer
