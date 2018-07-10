import _reducer from './requests'
import * as types from '../actions/types'
import get from 'lodash.get'

class Reducer {
    reducer = _reducer
    state = undefined

    applyAction = action => {
        this.state = this.reducer(this.state, action)
        return this.state
    }
}

describe('nion: reducers', () => {
    describe('requests reducer', () => {
        it('should return the initial state', () => {
            const reducer = new Reducer()
            reducer.applyAction({})
            expect(reducer.state).toEqual({})
        })

        it('handles a NION_API_REQUEST action', () => {
            const reducer = new Reducer()
            const dataKey = 'currentUser'

            const action = makeAction(types.NION_API_REQUEST, dataKey, {
                method: 'GET',
            })
            reducer.applyAction(action)
            const request = get(reducer.state, dataKey)
            expect(request.status).toEqual('pending')
            expect(request.isLoading).toEqual(true)
            expect(request.pending).toEqual('GET')
        })

        it('handles a NION_API_REQUEST action after a success', () => {
            const reducer = new Reducer()
            const dataKey = 'currentUser'

            const action = makeAction(types.NION_API_SUCCESS, dataKey, {
                method: 'GET',
            })
            reducer.applyAction(action)

            const requestAction = makeAction(types.NION_API_REQUEST, dataKey, {
                method: 'GET',
            })

            reducer.applyAction(requestAction)

            const request = get(reducer.state, dataKey)
            expect(request.isError).toEqual(false)
            expect(request.isLoaded).toEqual(true)
            expect(request.isLoading).toEqual(true)
        })

        it('handles a NION_API_SUCCESS action', () => {
            const reducer = new Reducer()
            const dataKey = 'currentUser'

            const action = makeAction(types.NION_API_SUCCESS, dataKey, {
                method: 'GET',
            })
            reducer.applyAction(action)
            const request = get(reducer.state, dataKey)
            expect(request.status).toEqual('success')

            const timeDiff = Math.abs(request.fetchedAt - Date.now())
            expect(timeDiff).toBeLessThan(3)
            expect(request.isError).toEqual(false)
            expect(request.isLoaded).toEqual(true)
            expect(request.isLoading).toEqual(false)
        })

        it('handles a NION_API_FAILURE action', () => {
            const reducer = new Reducer()
            const dataKey = 'currentUser'

            const errorName = 'Oh Snap!'
            const errors = 'Something went wrong'

            const action = makeAction(types.NION_API_FAILURE, dataKey, {
                method: 'GET',
                errors,
                name: errorName,
            })
            reducer.applyAction(action)
            const request = get(reducer.state, dataKey)
            expect(request.status).toEqual('error')
            expect(request.name).toEqual(errorName)
            expect(request.errors).toEqual(errors)
            const timeDiff = Math.abs(request.fetchedAt - Date.now())
            expect(timeDiff).toBeLessThan(3)
            expect(request.isError).toEqual(true)
            expect(request.isLoaded).toEqual(false)
            expect(request.isLoading).toEqual(false)
            expect(request.pending).toEqual(undefined)
        })
    })
})

function makeAction(actionType, dataKey, { method, name, errors }) {
    return {
        type: actionType,
        payload: {
            name,
            errors,
        },
        meta: {
            dataKey,
            method,
            fetchedAt: Date.now(),
        },
    }
}
