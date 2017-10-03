import Immutable from 'seamless-immutable'
import get from 'lodash.get'

const initialState = Immutable({})

import {
    NION_API_REQUEST,
    NION_API_BOOTSTRAP,
    NION_API_SUCCESS,
    INITIALIZE_DATAKEY,
    UPDATE_REF,
} from '../actions/types'

const deleteRefFromEntities = (refToDelete = {}, state = {}) => {
    const { type, id } = refToDelete
    if (!id || !type) {
        return state
    }

    // Iterate over all dataKeys on state to remove all instance of the
    // ref to be deleted
    Object.keys(state).forEach(dataKey => {
        const oldEntities = get(state[dataKey], 'entities')

        if (Array.isArray(oldEntities)) {
            const filtered = oldEntities.filter(entity => {
                return !(entity.type === type && entity.id === id)
            })
            state = state.setIn([dataKey, 'entities'], filtered)
        }
    })
    return state
}

const refsReducer = (state = initialState, action) => {
    switch (action.type) {
        case NION_API_REQUEST:
            return state
        case NION_API_BOOTSTRAP:
        case NION_API_SUCCESS:
            // If the result of a paginated nextPage request, we're going to want to append the
            // retrieved entities to the end of the current entities list
            if (action.meta.isNextPage || action.meta.append) {
                const nextPageRef = action.payload.responseData.entryRef
                const oldEntities = get(
                    state[action.meta.dataKey],
                    'entities',
                    [],
                )
                return state.merge(
                    {
                        [action.meta.dataKey]: {
                            ...nextPageRef,
                            isCollection: true,
                            entities: oldEntities.concat(nextPageRef.entities),
                        },
                    },
                    { deep: true },
                )
            } else if (action.meta.refToDelete) {
                // Else, if the result of a DELETE request, we must process delete corresponding
                // refs off of the references state
                return deleteRefFromEntities(action.meta.refToDelete, state)
                // Otherwise, append or update the ref to the state
            } else if (action.payload) {
                return state.set(
                    action.meta.dataKey,
                    action.payload.responseData.entryRef,
                )
                // Otherwise, the data returned was undefined
            } else {
                return state.set(action.meta.dataKey, undefined)
            }

        // Initialize a new dataKey from a ref passed to a child component
        case INITIALIZE_DATAKEY:
            return state.set(action.meta.dataKey, action.payload.ref)

        // Update a reference attached to a dataKey explicitly
        case UPDATE_REF:
            return state.set(action.meta.dataKey, action.payload.ref)

        default:
            return state
    }
}

export default refsReducer
