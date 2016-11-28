const initialState = {}

const entitiesReducer = (state = initialState, action) => {
    if (action.type === 'JSON_API_SUCCESS') {
        const newState = {
            ...state
        }
        Object.keys(action.payload.storeFragment).map((entityKey) => {
            newState[entityKey] = {
                ...newState[entityKey],
                ...action.payload.storeFragment[entityKey]
            }
        })
        return newState
    }
    return state
}

export default entitiesReducer
