const initialState = {}

const refsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'JSON_API_REQUEST':
            return {
                ...state
            }
        case 'JSON_API_BOOTSTRAP':
        case 'JSON_API_SUCCESS':
            // If the result of a paginated nextPage request, we're going to want to append the
            // retrieved entities to the end of the current entities list
            if (action.meta.isNextPage) {
                const nextPageRef = action.payload.newRequestRef
                return {
                    ...state,
                    [action.meta.dataKey]: {
                        ...nextPageRef,
                        entities: state[action.meta.dataKey].entities.concat(nextPageRef.entities)
                    }
                }
            } else {
                return {
                    ...state,
                    [action.meta.dataKey]: action.payload.newRequestRef
                }
            }
        default:
            return state
    }
}

export default refsReducer
