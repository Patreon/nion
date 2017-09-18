import get from 'lodash.get'
import map from 'lodash.map'

import {
    NION_API_SUCCESS,
    NION_API_BOOTSTRAP,
    UPDATE_ENTITY,
} from '../actions/types'

const initialState = {}

// The core reducer for maintaining a normalized entity store of entities that are fetched / updated
// between different JSON API actions
const entitiesReducer = (state = initialState, action) => {
    switch (action.type) {
        case NION_API_SUCCESS:
        case NION_API_BOOTSTRAP: {
            const newState = {
                ...state,
            }

            const storeFragment = get(
                action,
                'payload.responseData.storeFragment',
                {},
            )

            map(storeFragment, (entities, type) => {
                newState[type] = {
                    ...get(newState, type, {}),
                }

                map(entities, (entity, id) => {
                    newState[type][id] = {
                        type,
                        id,
                        attributes: {
                            ...get(newState[type][id], 'attributes', {}),
                            ...get(entity, 'attributes', {}),
                        },
                        relationships: {
                            ...get(newState[type][id], 'relationships', {}),
                            ...get(entity, 'relationships', {}),
                        },
                    }
                })
            })

            const refToDelete = get(action, 'meta.refToDelete')
            if (
                refToDelete &&
                refToDelete.id !== undefined &&
                refToDelete.type
            ) {
                delete newState[refToDelete.type][refToDelete.id]
            }
            return newState
        }
        case UPDATE_ENTITY: {
            const { type, id, attributes } = action.payload
            const entity = state[type][id]
            const newEntity = {
                ...entity,
                attributes: {
                    ...entity.attributes,
                    ...attributes,
                },
            }

            const newState = {
                ...state,
                [type]: {
                    ...state[type],
                    [id]: newEntity,
                },
            }

            return newState
        }
        default:
            return state
    }
}

export default entitiesReducer
