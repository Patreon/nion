import Immutable from 'seamless-immutable'
import get from 'lodash.get'

import {
    NION_API_SUCCESS,
    NION_API_BOOTSTRAP,
    UPDATE_ENTITY,
} from '../actions/types'

const initialState = Immutable({})

// The core reducer for maintaining a normalized entity store of entities that are fetched / updated
// between different JSON API actions
const entitiesReducer = (state = initialState, action) => {
    switch (action.type) {
        case NION_API_SUCCESS:
        case NION_API_BOOTSTRAP: {
            const storeFragment = get(
                action,
                'payload.responseData.storeFragment',
                {},
            )

            console.log('🐷', storeFragment)

            let nextState = state.merge(storeFragment, { deep: true })
            // Handle deletion
            const refToDelete = get(action, 'meta.refToDelete')
            if (
                refToDelete &&
                refToDelete.id !== undefined &&
                refToDelete.type
            ) {
                const { type, id } = refToDelete
                nextState = nextState.without([type, id])
            }
            return nextState
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
