const initialState = {}

const refsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'JSON_API_REQUEST':
            return {
                ...state
            }
        case 'JSON_API_SUCCESS':
            return {
                ...state,
                [action.meta.dataKey]: action.payload.newRequestRef
            }
        default:
            return state
    }
}

export default refsReducer
