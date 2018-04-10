/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react'
import { mount } from 'enzyme'
import nock from 'nock'
import { Provider } from 'react-redux'
import P from 'bluebird'

import Nion from '../Nion'
import configureTestStore from '../../../test/configure-test-store'
import { ActionStatus } from '../../constants'

const Wrap = (Wrapped, props) => {
    const store = configureTestStore()
    return (
        <Provider store={store}>
            <Wrapped {...props} />
        </Provider>
    )
}

const baseUrl = 'http://api.test.com'
const buildUrl = path =>
    path.startsWith('/') ? baseUrl + path : baseUrl + '/' + path

describe('Nion Render Prop Component', () => {
    afterEach(() => {
        nock.cleanAll()
    })

    test(`does render nion data through the render prop component`, async () => {
        const pathname = 'test'
        const name = 'Testy McTestFace'
        const endpoint = buildUrl(pathname)

        nock(endpoint)
            .get('')
            .query(true)
            .reply(200, {
                data: {
                    id: 123,
                    type: 'animal',
                    attributes: { name },
                },
            })

        class Container extends Component {
            render() {
                return (
                    <Nion
                        declaration={{ user: { endpoint, fetchOnInit: true } }}
                        render={({ request, data }) =>
                            request.status === ActionStatus.SUCCESS ? (
                                <p>{data.name}</p>
                            ) : (
                                <div />
                            )
                        }
                    />
                )
            }
        }

        const Wrapper = mount(Wrap(Container))
        await P.delay(50)

        const getRenderEl = () => Wrapper.update()
        const renderEl = getRenderEl()
        expect(renderEl.text()).toEqual(name)
    })
})
