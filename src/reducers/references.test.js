import _reducer from './references'
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
    describe('references reducer', () => {
        it('should return the initial state', () => {
            const reducer = new Reducer()
            reducer.applyAction({})
            expect(reducer.state).toEqual({})
        })

        it('handles a NION_API_BOOTSTRAP action', () => {
            const reducer = new Reducer()
            const dataKey = 'currentUser'

            const action = makeAction(types.NION_API_BOOTSTRAP, dataKey, {
                entryRef: { type: 'user', id: 123 },
            })

            reducer.applyAction(action)
            const currentUser = get(reducer.state, dataKey)

            expect(currentUser.type).toEqual('user')
            expect(currentUser.id).toEqual(123)
        })

        it('handles a NION_API_SUCCESS action', () => {
            const reducer = new Reducer()
            const dataKey = 'currentUser'

            const action = makeAction(types.NION_API_SUCCESS, dataKey, {
                entryRef: { entities: [{ type: 'user', id: 123 }] },
            })

            reducer.applyAction(action)
            const currentUser = get(reducer.state, [dataKey, 'entities', 0])

            expect(currentUser.type).toEqual('user')
            expect(currentUser.id).toEqual(123)
        })

        it('handles a NION_API_SUCCESS with meta.isNextPage', () => {
            const reducer = new Reducer()
            const dataKey = 'users'

            const action = makeAction(types.NION_API_SUCCESS, dataKey, {
                entryRef: {
                    entities: [{ type: 'user', id: 123 }],
                },
            })
            reducer.applyAction(action)

            const nextAction = makeAction(types.NION_API_SUCCESS, dataKey, {
                entryRef: {
                    entities: [{ type: 'user', id: 456 }],
                },
                isNextPage: true,
            })
            reducer.applyAction(nextAction)

            const currentUser = get(reducer.state, [dataKey, 'entities', 1])
            const isCollection = get(reducer.state, [dataKey, 'isCollection'])
            expect(currentUser.type).toEqual('user')
            expect(currentUser.id).toEqual(456)
            expect(isCollection).toEqual(true)
        })

        it('handles a NION_API_SUCCESS with meta.append', () => {
            const reducer = new Reducer()
            const dataKey = 'users'

            const action = makeAction(types.NION_API_SUCCESS, dataKey, {
                entryRef: {
                    entities: [{ type: 'user', id: 123 }],
                },
            })
            reducer.applyAction(action)

            const nextAction = makeAction(types.NION_API_SUCCESS, dataKey, {
                entryRef: {
                    entities: [{ type: 'user', id: 456 }],
                },
                append: true,
            })
            reducer.applyAction(nextAction)

            const currentUser = get(reducer.state, [dataKey, 'entities', 1])
            const isCollection = get(reducer.state, [dataKey, 'isCollection'])
            expect(currentUser.type).toEqual('user')
            expect(currentUser.id).toEqual(456)
            expect(isCollection).toEqual(true)
        })

        it('adds links', () => {
            const reducer = new Reducer()
            const dataKey = 'users'

            const action = makeAction(types.NION_API_SUCCESS, dataKey, {
                entryRef: {
                    links: { next: 'place', prev: 'otherplace' },
                },
            })

            reducer.applyAction(action)

            const currentLinks = get(reducer.state, [dataKey, 'links'])
            expect(currentLinks.next).toBe('place')
            expect(currentLinks.prev).toBe('otherplace')
        })

        it('keeps links up to date', () => {
            const reducer = new Reducer()
            const dataKey = 'users'

            const action = makeAction(types.NION_API_SUCCESS, dataKey, {
                entryRef: {
                    links: { next: 'place', prev: 'place' },
                },
            })
            reducer.applyAction(action)

            const nextAction = makeAction(types.NION_API_SUCCESS, dataKey, {
                entryRef: {
                    links: {},
                },
                append: true,
            })
            reducer.applyAction(nextAction)

            const currentLinks = get(reducer.state, [dataKey, 'links'])
            expect(currentLinks.next).toBe(null)
            expect(currentLinks.prev).toBe(null)
        })

        it('handles a NION_API_SUCCESS with meta.refToDelete', () => {
            const reducer = new Reducer()
            const dataKey = 'users'

            const action = makeAction(types.NION_API_SUCCESS, dataKey, {
                entryRef: {
                    entities: [
                        { type: 'user', id: 123 },
                        { type: 'user', id: 456 },
                    ],
                    isCollection: true,
                },
            })
            reducer.applyAction(action)

            const nextAction = makeAction(types.NION_API_SUCCESS, dataKey, {
                refToDelete: { type: 'user', id: 456 },
            })
            reducer.applyAction(nextAction)

            const users = get(reducer.state, [dataKey, 'entities'])
            const isCollection = get(reducer.state, [dataKey, 'isCollection'])
            expect(users.length).toEqual(1)
            expect(users[0].id).toEqual(123)
            expect(isCollection).toEqual(true)
        })

        it('handles a INITIALIZE_DATAKEY action with a new ref', () => {
            const reducer = new Reducer()
            const dataKey = 'user'

            const action = makeAction(types.INITIALIZE_DATAKEY, dataKey, {
                ref: {
                    entities: [{ type: 'user', id: 123 }],
                },
            })
            reducer.applyAction(action)

            const user = get(reducer.state, [dataKey, 'entities', 0])
            expect(user.type).toEqual('user')
            expect(user.id).toEqual(123)
        })

        it('handles a UPDATE_REF action with a new ref', () => {
            const reducer = new Reducer()
            const dataKey = 'user'

            const action = makeAction(types.INITIALIZE_DATAKEY, dataKey, {
                ref: {
                    entities: [{ type: 'user', id: 123 }],
                },
            })
            reducer.applyAction(action)

            const nextAction = makeAction(types.UPDATE_REF, dataKey, {
                ref: {
                    entities: [{ type: 'user', id: 456 }],
                },
            })
            reducer.applyAction(nextAction)

            const user = get(reducer.state, [dataKey, 'entities', 0])
            expect(user.type).toEqual('user')
            expect(user.id).toEqual(456)
        })

        it('filters out refsToDelete from all refs', () => {
            const reducer = new Reducer()

            const initializationActions = [
                makeAction(types.INITIALIZE_DATAKEY, 'userGroupA', {
                    ref: {
                        entities: [
                            { type: 'user', id: 123 },
                            { type: 'user', id: 456 },
                        ],
                    },
                }),
                makeAction(types.INITIALIZE_DATAKEY, 'userGroupB', {
                    ref: {
                        entities: [
                            { type: 'user', id: 123 },
                            { type: 'user', id: 789 },
                        ],
                    },
                }),
            ]
            reducer.applyAction(initializationActions[0])
            reducer.applyAction(initializationActions[1])

            const deleteAction = makeAction(
                types.NION_API_SUCCESS,
                'someDataKey',
                {
                    refToDelete: { type: 'user', id: 123 },
                },
            )
            reducer.applyAction(deleteAction)

            const userGroupARef = get(reducer.state, 'userGroupA')
            expect(userGroupARef.entities.length).toEqual(1)
            const remaingingUserA = userGroupARef.entities[0]
            expect(remaingingUserA.type).toEqual('user')
            expect(remaingingUserA.id).toEqual(456)

            const userGroupBRef = get(reducer.state, 'userGroupB')
            expect(userGroupBRef.entities.length).toEqual(1)
            const remaingingUserB = userGroupBRef.entities[0]
            expect(remaingingUserB.type).toEqual('user')
            expect(remaingingUserB.id).toEqual(789)
        })
    })
})

function makeAction(
    actionType,
    dataKey,
    { entryRef, ref, isNextPage, append, refToDelete },
) {
    return {
        type: actionType,
        payload: {
            dataKey,
            ref,
            responseData: {
                entryRef,
            },
        },
        meta: {
            dataKey,
            isNextPage,
            append,
            refToDelete,
        },
    }
}
