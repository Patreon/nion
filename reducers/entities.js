import get from 'lodash.get'
import map from 'lodash.map'
const initialState = {}

// The core reducer for maintaining a normalized entity store of entities that are fetched / updated
// between different JSON API actions
const entitiesReducer = (state = initialState, action) => {
    if (action.type === 'JSON_API_SUCCESS' || action.type === 'JSON_API_BOOTSTRAP') {
        const newState = {
            ...state
        }

        map(action.payload.storeFragment, (entities, type) => {

            newState[type] = {
                ...get(newState, type, {})
            }

            map(entities, (entity, id) => {

                newState[type][id] = {
                    attributes: {
                        ...get(newState[type][id], 'attributes', {}),
                        ...get(entity, 'attributes', {})
                    },
                    relationships: {
                        ...get(newState[type][id], 'relationships', {}),
                        ...get(entity, 'relationships', {})
                    }
                }
            })
        })
        return newState
    }
    return state
}

export default entitiesReducer
