import Immutable from 'seamless-immutable'
import get from 'lodash/get'

import {
    NION_API_SUCCESS,
    NION_API_BOOTSTRAP,
    UPDATE_ENTITY,
} from '../actions/types'

import { filterRelationshipsFromState } from './utils'

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

            let nextState = state.merge(storeFragment, { deep: true })

            // Handle deletion
            const refToDelete = get(action, 'meta.refToDelete')
            if (
                refToDelete &&
                refToDelete.id !== undefined &&
                refToDelete.type
            ) {
                const { type, id } = refToDelete
                const exists =
                    nextState[type] && nextState[type][id] !== undefined
                if (exists) {
                    const removed = Immutable.without(nextState[type], id)
                    nextState = nextState.set(type, removed)
                }

                nextState = filterRelationshipsFromState(nextState, id, type)
            }
            return nextState
        }
        case UPDATE_ENTITY: {
            const { type, id, attributes } = action.payload
            const entity = state[type][id]
            const newAttributes = {
                ...entity.attributes,
                ...attributes,
            }

            return state.setIn([type, id, 'attributes'], newAttributes)
        }
        default:
            return state
    }
}

export default entitiesReducer
