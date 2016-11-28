import get from 'lodash.get'

const initialState = {}

const requestsReducer = (state = initialState, action) => {
    if (action.error) {
        return {
            ...state,
            [action.meta.dataKey]: {
                status: 'error',
                name: action.payload.name,
                errors: [action.payload.message]
            }
        }
    }

    switch (action.type) {
        case 'JSON_API_REQUEST':
            return {
                ...state,
                [action.meta.dataKey]: {
                    status: 'pending'
                }
            }
        case 'JSON_API_SUCCESS':
            return {
                ...state,
                [action.meta.dataKey]: {
                    status: 'success',
                    fetchedAt: Date.now()
                }
            }
        case 'JSON_API_FAILURE':
            return {
                ...state,
                [action.meta.dataKey]: {
                    status: 'error',
                    name: 'PatreonApiError',
                    errors: get(action, 'errors') || [],
                    fetchedAt: Date.now()
                }
            }
        default:
            return state
    }
}

export default requestsReducer
