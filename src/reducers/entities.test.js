import _reducer from './entities'
import * as types from '../actions/types'
import get from 'lodash/get'

class StoreFragment {
    fragment = {}
    addEntity = (type, id, attributes = {}, relationships = {}) => {
        this.fragment = {
            ...this.fragment,
            [type]: {
                ...this.fragment[type],
                [id]: { attributes, relationships },
            },
        }
    }

    toPayload = dbg => {
        return this.fragment
    }
}

class Reducer {
    reducer = _reducer
    state = undefined

    applyAction = action => {
        this.state = this.reducer(this.state, action)
        return this.state
    }
}

describe('nion: reducers', () => {
    describe('entities reducer', () => {
        it('should return the initial state', () => {
            const reducer = new Reducer()
            reducer.applyAction({})
            expect(reducer.state).toEqual({})
        })

        it('should handle basic NION_API_SUCCESS instantiation', () => {
            const storeFragment = new StoreFragment()
            const reducer = new Reducer()

            storeFragment.addEntity('user', 123, { name: 'Test User' })

            const action = makeActionWithFragment(
                types.NION_API_SUCCESS,
                storeFragment.toPayload(),
            )
            reducer.applyAction(action)
            const name = get(reducer.state, ['user', 123, 'attributes', 'name'])
            expect(name).toEqual('Test User')
        })

        it('should handle basic NION_API_BOOTSTRAP instantiation', () => {
            const storeFragment = new StoreFragment()
            const reducer = new Reducer()

            storeFragment.addEntity('user', 123, { name: 'Test User' })

            const action = makeActionWithFragment(
                types.NION_API_BOOTSTRAP,
                storeFragment.toPayload(),
            )
            reducer.applyAction(action)
            const name = get(reducer.state, ['user', 123, 'attributes', 'name'])
            expect(name).toEqual('Test User')
        })

        it('should handle NION_API_SUCCESS / NION_API_BOOTSTRAP relationships', () => {
            const storeFragment = new StoreFragment()
            const reducer = new Reducer()

            storeFragment.addEntity(
                'user',
                123,
                { name: 'Test User' },
                { campaign: 456 },
            )
            storeFragment.addEntity(
                'campaign',
                456,
                { name: 'Test Campaign' },
                { user: 123 },
            )

            const action = makeActionWithFragment(
                types.NION_API_SUCCESS,
                storeFragment.toPayload(),
            )
            reducer.applyAction(action)
            const campaignId = get(reducer.state, [
                'user',
                123,
                'relationships',
                'campaign',
            ])
            expect(campaignId).toEqual(456)
        })

        it('subsequent SUCCESS / BOOTSTRAP actions should add additional attributes', () => {
            const testName = 'Test User'
            const testAge = 22
            const testUserId = '123'

            const storeFragment = new StoreFragment()
            const reducer = new Reducer()

            storeFragment.addEntity('user', testUserId, { name: testName })

            const firstAction = makeActionWithFragment(
                types.NION_API_SUCCESS,
                storeFragment.toPayload(),
            )

            reducer.applyAction(firstAction)
            let name = get(reducer.state, `user.${testUserId}.attributes.name`)
            expect(name).toEqual(testName)

            storeFragment.addEntity('user', testUserId, { age: testAge })
            const secondAction = makeActionWithFragment(
                types.NION_API_SUCCESS,
                storeFragment.toPayload(true),
            )

            reducer.applyAction(secondAction)
            name = get(reducer.state, `user.${testUserId}.attributes.name`)
            expect(name).toEqual(testName)
            let age = (name = get(
                reducer.state,
                `user.${testUserId}.attributes.age`,
            ))
            expect(age).toEqual(testAge)
        })

        it('subsequent SUCCESS / BOOTSTRAP actions should overwrite attributes', () => {
            const firstAge = 25
            const secondAge = 28
            const testUserId = '123'

            const storeFragment = new StoreFragment()
            const reducer = new Reducer()

            storeFragment.addEntity('user', testUserId, { age: firstAge })

            const firstAction = makeActionWithFragment(
                types.NION_API_SUCCESS,
                storeFragment.toPayload(),
            )

            reducer.applyAction(firstAction)
            let age = get(reducer.state, `user.${testUserId}.attributes.age`)
            expect(age).toEqual(firstAge)

            storeFragment.addEntity('user', testUserId, { age: secondAge })
            const secondAction = makeActionWithFragment(
                types.NION_API_SUCCESS,
                storeFragment.toPayload(true),
            )

            reducer.applyAction(secondAction)
            age = get(reducer.state, `user.${testUserId}.attributes.age`)
            expect(age).toEqual(secondAge)
        })

        it('subsequent SUCCESS / BOOTSTRAP actions should add additional relationships', () => {
            const testName = 'Test User'
            const testUserId = 123
            const firstRelationship = { type: 'campaign', id: 456 }
            const secondRelationship = { type: 'bestFriend', id: 789 }

            const storeFragment = new StoreFragment()
            const reducer = new Reducer()

            storeFragment.addEntity(
                'user',
                testUserId,
                { name: testName },
                { [firstRelationship.type]: firstRelationship.id },
            )

            const firstAction = makeActionWithFragment(
                types.NION_API_SUCCESS,
                storeFragment.toPayload(),
            )

            reducer.applyAction(firstAction)
            let campaignId = get(
                reducer.state,
                `user.${testUserId}.relationships.campaign`,
            )
            expect(campaignId).toEqual(firstRelationship.id)

            storeFragment.addEntity(
                'user',
                testUserId,
                { name: testName },
                { [secondRelationship.type]: secondRelationship.id },
            )

            const secondAction = makeActionWithFragment(
                types.NION_API_SUCCESS,
                storeFragment.toPayload(),
            )

            reducer.applyAction(secondAction)
            campaignId = get(
                reducer.state,
                `user.${testUserId}.relationships.campaign`,
            )
            expect(campaignId).toEqual(firstRelationship.id)

            const bestFriendId = get(
                reducer.state,
                `user.${testUserId}.relationships.bestFriend`,
            )
            expect(bestFriendId).toEqual(secondRelationship.id)
        })

        it('subsequent SUCCESS / BOOTSTRAP actions should overwrite relationships', () => {
            const testName = 'Test User'
            const testUserId = 123
            const firstRelationship = { type: 'campaign', id: 456 }
            const secondRelationship = { type: 'campaign', id: 789 }

            const storeFragment = new StoreFragment()
            const reducer = new Reducer()

            storeFragment.addEntity(
                'user',
                testUserId,
                { name: testName },
                { [firstRelationship.type]: firstRelationship.id },
            )

            const firstAction = makeActionWithFragment(
                types.NION_API_SUCCESS,
                storeFragment.toPayload(),
            )

            reducer.applyAction(firstAction)
            let campaignId = get(
                reducer.state,
                `user.${testUserId}.relationships.campaign`,
            )
            expect(campaignId).toEqual(firstRelationship.id)

            storeFragment.addEntity(
                'user',
                testUserId,
                { name: testName },
                { [secondRelationship.type]: secondRelationship.id },
            )

            const secondAction = makeActionWithFragment(
                types.NION_API_SUCCESS,
                storeFragment.toPayload(),
            )

            reducer.applyAction(secondAction)
            campaignId = get(
                reducer.state,
                `user.${testUserId}.relationships.campaign`,
            )
            expect(campaignId).toEqual(secondRelationship.id)
        })

        it('deletes refs with meta.refToDelete', () => {
            const firstStoreFragment = new StoreFragment()
            const reducer = new Reducer()

            firstStoreFragment.addEntity('user', 123, { name: 'Test User' })
            firstStoreFragment.addEntity('campaign', 456, {
                name: 'Test Campaign',
            })
            firstStoreFragment.addEntity('campaign', 789, {
                name: 'Test Campaign 2',
            })

            const action = makeActionWithFragment(
                types.NION_API_SUCCESS,
                firstStoreFragment.toPayload(),
            )
            reducer.applyAction(action)
            const campaignName = get(
                reducer.state,
                `campaign.${456}.attributes.name`,
            )
            expect(campaignName).toEqual('Test Campaign')

            // Ad hoc create an action that deletes the campaign ref
            const nextAction = {
                type: types.NION_API_SUCCESS,
                payload: {
                    responseData: {
                        storeFragment: {},
                    },
                },
                meta: {
                    refToDelete: {
                        type: 'campaign',
                        id: 456,
                    },
                },
            }

            reducer.applyAction(nextAction)

            expect(get(reducer.state, 'campaign')).not.toHaveProperty('456')

            // It doesn't delete other entities from the store
            const user = get(reducer.state, `user.${123}`)
            expect(user).toBeDefined()

            const otherCampaign = get(reducer.state, `campaign.${789}`)
            expect(otherCampaign).toBeDefined()
        })

        it('deletes relationship refs with meta.refToDelete', () => {
            const firstStoreFragment = new StoreFragment()
            const reducer = new Reducer()

            firstStoreFragment.addEntity(
                'user',
                123,
                { name: 'Test User' },
                {
                    campaigns: {
                        data: [
                            { id: 456, type: 'campaign' },
                            { id: 789, type: 'campaign' },
                        ],
                    },
                },
            )
            firstStoreFragment.addEntity('campaign', 456, {
                name: 'Test Campaign',
            })
            firstStoreFragment.addEntity('campaign', 789, {
                name: 'Test Campaign 2',
            })

            const action = makeActionWithFragment(
                types.NION_API_SUCCESS,
                firstStoreFragment.toPayload(),
            )
            reducer.applyAction(action)
            const campaignName = get(
                reducer.state,
                `campaign.${456}.attributes.name`,
            )
            expect(campaignName).toEqual('Test Campaign')

            expect(
                get(reducer.state, `user.${123}.relationships.campaigns.data`),
            ).toHaveLength(2)

            // Ad hoc create an action that deletes the campaign ref
            const nextAction = {
                type: types.NION_API_SUCCESS,
                payload: {
                    responseData: {
                        storeFragment: {},
                    },
                },
                meta: {
                    refToDelete: {
                        type: 'campaign',
                        id: 456,
                    },
                },
            }

            reducer.applyAction(nextAction)

            expect(
                get(reducer.state, `user.${123}.relationships.campaigns.data`),
            ).toHaveLength(1)

            const finalAction = {
                type: types.NION_API_SUCCESS,
                payload: {
                    responseData: {
                        storeFragment: {},
                    },
                },
                meta: {
                    refToDelete: {
                        type: 'campaign',
                        id: 789,
                    },
                },
            }

            reducer.applyAction(finalAction)

            expect(
                get(reducer.state, `user.${123}.relationships.campaigns.data`),
            ).toHaveLength(0)
        })

        it('handles the UPDATE_ENTITY action', () => {
            const firstStoreFragment = new StoreFragment()
            const reducer = new Reducer()

            firstStoreFragment.addEntity('campaign', 456, {
                name: 'Test Campaign',
            })

            const action = makeActionWithFragment(
                types.NION_API_SUCCESS,
                firstStoreFragment.toPayload(),
            )
            reducer.applyAction(action)
            let campaignName = get(
                reducer.state,
                `campaign.${456}.attributes.name`,
            )
            expect(campaignName).toEqual('Test Campaign')

            // Ad hoc create an UPDATE_ENTITY action
            const nextAction = {
                type: types.UPDATE_ENTITY,
                payload: {
                    type: 'campaign',
                    id: 456,
                    attributes: {
                        name: 'Some other name',
                        time: 1234,
                    },
                },
            }

            reducer.applyAction(nextAction)
            campaignName = get(reducer.state, `campaign.${456}.attributes.name`)
            const campaignTime = get(
                reducer.state,
                `campaign.${456}.attributes.time`,
            )
            expect(campaignName).toEqual('Some other name')
            expect(campaignTime).toEqual(1234)
        })
    })
})

function makeActionWithFragment(actionType, storeFragment) {
    return {
        type: actionType,
        payload: {
            responseData: {
                storeFragment,
            },
        },
    }
}
