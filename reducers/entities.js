import get from 'lodash.get'
import map from 'lodash.map'
import { camelizeKeys, camelize } from 'humps'

const initialState = {}

// The core reducer for maintaining a normalized entity store of entities that are fetched / updated
// between different JSON API actions
const entitiesReducer = (state = initialState, action) => {
    if (action.type === 'JSON_API_SUCCESS' || action.type === 'JSON_API_BOOTSTRAP') {
        const newState = {
            ...state
        }

        map(action.payload.storeFragment, (entities, type) => {

            type = camelize(type)

            newState[type] = {
                ...get(newState, type, {})
            }

            map(entities, (entity, id) => {
                newState[type][id] = {
                    type,
                    id,
                    attributes: {
                        ...get(newState[type][id], 'attributes', {}),
                        ...camelizeKeys(get(entity, 'attributes', {}))
                    },
                    relationships: {
                        ...get(newState[type][id], 'relationships', {}),
                        ...camelizeKeys(get(entity, 'relationships', {}))
                    }
                }
            })
        })

        const entityToDelete = get(action, 'meta.refToDelete')
        if (entityToDelete) {
            delete newState[entityToDelete.type][entityToDelete.id]
        }
        return newState
    }
    return state
}

export default entitiesReducer
