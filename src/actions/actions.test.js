import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import nock from 'nock'
import union from 'lodash.union'
import ApiManager from '../api'

import * as actionTypes from './types'
import apiActions from './index'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

class ApiEndpoint {
    get url() {
        return this.baseUrl + this.route
    }
    constructor(baseUrl = 'http://api.test.com', route = '/items') {
        this.baseUrl = baseUrl
        this.route = route
    }
}

describe('nion: actions', () => {
    describe('API actions', () => {
        afterEach(() => {
            nock.cleanAll()
        })

        it('GET api action should create the correct actions ', async () => {
            const apiEndpoint = new ApiEndpoint()
            const jsonPayload = { body: {} }

            nock(apiEndpoint.baseUrl)
                .get(apiEndpoint.route)
                .reply(200, jsonPayload)

            const dataKey = 'items'
            const expectedActions = [
                {
                    type: actionTypes.NION_API_REQUEST,
                    meta: {
                        dataKey,
                        endpoint: apiEndpoint.url,
                        method: 'GET',
                    },
                },
                {
                    type: actionTypes.NION_API_SUCCESS,
                    meta: {
                        dataKey,
                        fetchedAt: Date.now(),
                        endpoint: apiEndpoint.url,
                        method: 'GET',
                    },
                    payload: {
                        requestType: ApiManager.getDefaultApi(),
                        responseData: ApiManager.getParser()(jsonPayload),
                    },
                },
            ]

            const store = mockStore({})

            const newActions = apiActions

            console.log(newActions)
            console.log(newActions.get)

            await store.dispatch(
                newActions.get(dataKey, {
                    endpoint: apiEndpoint.url,
                }),
            )

            const observedActions = store.getActions()
            expectedActions.forEach((expectedAction, index) => {
                assertEqualAction(expectedAction, observedActions[index])
            })
        })

        it('GET api action should handle errors with the correct actions ', async () => {
            const apiEndpoint = new ApiEndpoint()
            const jsonPayload = { body: {} }

            nock(apiEndpoint.baseUrl)
                .get(apiEndpoint.route)
                .reply(500, jsonPayload)

            const dataKey = 'items'
            const expectedActions = [
                {
                    type: actionTypes.NION_API_REQUEST,
                    meta: {
                        dataKey,
                        endpoint: apiEndpoint.url,
                        method: 'GET',
                    },
                },
                {
                    type: actionTypes.NION_API_FAILURE,
                    meta: {
                        dataKey,
                        fetchedAt: Date.now(),
                        endpoint: apiEndpoint.url,
                        method: 'GET',
                    },
                },
            ]

            const store = mockStore({})

            try {
                await store.dispatch(
                    apiActions.get(dataKey, {
                        endpoint: apiEndpoint.url,
                    }),
                )
            } catch (err) {
                // TODO: Get this working with the ApiManager.getErrorClass class constructor
                expect(err).toBeInstanceOf(Error)
                // Replace the error in the expectedAction payload with the Error caught here
                // to simulate the logic of the payload construction
                expectedActions[1].payload = err
            }

            const observedActions = store.getActions()
            expectedActions.forEach((expectedAction, index) => {
                assertEqualAction(expectedAction, observedActions[index])
            })
        })
    })
})

function assertEqualAction(expected, observed) {
    expect(expected.type).toEqual(observed.type)

    const metaKeys = union(
        Object.keys(expected.meta || {}),
        Object.keys(observed.meta || {}),
    )
    metaKeys.forEach(metaKey => {
        if (metaKey === 'fetchedAt') {
            // Check to see that our fetchedAt value is within 30ms of our actual value
            const diff = expected.meta.fetchedAt - observed.meta.fetchedAt
            expect(Math.abs(diff)).toBeLessThan(100)
        } else {
            expect(expected.meta[metaKey]).toEqual(observed.meta[metaKey])
        }
    })

    const payloadKeys = union(
        Object.keys(expected.payload || {}),
        Object.keys(observed.payload || {}),
    )
    payloadKeys.forEach(payloadKey => {
        expect(expected.payload[payloadKey]).toEqual(
            observed.payload[payloadKey],
        )
    })
}
