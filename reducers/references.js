import get from 'lodash.get'

const initialState = {}

import {
    JSON_API_REQUEST,
    JSON_API_BOOTSTRAP,
    JSON_API_SUCCESS,
    GENERIC_BOOTSTRAP
} from '../actions/types'

// Yes, a bit funny - but it turns out this is a safe, fast, and terse way of deep cloning data
const clone = (input) => JSON.parse(JSON.stringify(input))

const deleteRefFromEntities = (refToDelete, state) => {
    if (!(get(refToDelete, 'type') && get(refToDelete, 'id'))) {
        return state
    }
    return Object.keys(state).reduce((memo, dataKey) => {
        const oldEntites = state[dataKey].entities
        if (Array.isArray(oldEntites)) {
            memo[dataKey] = {
                ...state[dataKey],
                entities: oldEntites.filter((entity) => (
                    !(entity.type === refToDelete.type && entity.id === refToDelete.id)
                ))
            }
        } else {
            memo[dataKey] = state[dataKey]
        }
        return memo
    }, {})
}

const refsReducer = (state = initialState, action) => {
    switch (action.type) {
        case JSON_API_REQUEST:
            return state
        case JSON_API_BOOTSTRAP:
        case JSON_API_SUCCESS:
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
                    // if there's no ref to delete, this is a no-op
                    ...deleteRefFromEntities(get(action, 'meta.refToDelete'), state),
                    [action.meta.dataKey]: action.payload.newRequestRef
                }
            }

        // Handle generic refs to non json-api data
        case GENERIC_BOOTSTRAP:
            return {
                ...state,
                [action.meta.dataKey]: clone(action.payload)
            }
        default:
            return state
    }
}

export default refsReducer
