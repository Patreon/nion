import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import nock from 'nock'
import ApiManager from '../api'

import * as actionTypes from './types'
import * as apiActions from './index'

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

            await store.dispatch(
                apiActions.get(dataKey, {
                    endpoint: apiEndpoint.url,
                }),
            )

            const obvservedActions = store.getActions()
            expectedActions.forEach((expectedAction, index) => {
                expect(expectedAction).toEqual(obvservedActions[index])
            })
        })
    })
})
