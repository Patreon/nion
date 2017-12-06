/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react'
import { mount } from 'enzyme'
import nock from 'nock'
import P from 'bluebird'
import { Provider } from 'react-redux'

import nion from '../../../'
import configureTestStore from '../../../../test/configure-test-store'

const Wrap = (Wrapped, props) => {
    const store = configureTestStore()
    return (
        <Provider store={store}>
            <Wrapped {...props} />
        </Provider>
    )
}

const INCREMENT = 100
const FUDGE_FACTOR = 25 // account for imperfect delay

const baseUrl = 'http://api.test.com'
const buildUrl = path =>
    path.startsWith('/') ? baseUrl + path : baseUrl + '/' + path

const generateWrappedComponent = endpoint => {
    @nion({
        notifications: {
            endpoint,
            extensions: {
                polling: {
                    key: 'notifications',
                    delay: INCREMENT,
                },
            },
        },
    })
    class Container extends Component {
        render() {
            return null
        }
    }

    const Wrapper = mount(Wrap(Container))
    const Wrapped = Wrapper.find('Container')

    return Wrapped
}

describe('Polling extension', () => {
    afterEach(() => {
        nock.cleanAll()
    })

    test('adds actions and meta values', () => {
        const endpoint = buildUrl(`notifications`)

        nock(endpoint)
            .persist()
            .get('')
            .reply(200, {})

        const Wrapped = generateWrappedComponent(endpoint)
        const getProp = () => Wrapped.props().nion.notifications
        const notifications = getProp()

        expect(notifications.extensions.polling.start).toBeInstanceOf(Function)
        expect(notifications.extensions.polling.stop).toBeInstanceOf(Function)
        expect(notifications.extensions.polling.meta.isActive()).toBe(false)
    })

    test('pollStart and pollStop work as expected', async () => {
        const endpoint = buildUrl(`notifications`)

        let callCount = 0
        const incrementCallCount = () => callCount++

        nock(endpoint)
            .persist()
            .get('')
            .reply(200, () => {
                incrementCallCount()
                return {}
            })

        const Wrapped = generateWrappedComponent(endpoint)
        const getProp = () => Wrapped.props().nion.notifications

        let notifications = getProp()

        notifications.extensions.polling.start()
        await P.delay(INCREMENT * 3 + FUDGE_FACTOR)
        notifications = getProp()
        expect(callCount).toBe(3)
        expect(notifications.extensions.polling.meta.isActive()).toBe(true)

        notifications.extensions.polling.stop()
        await P.delay(INCREMENT + FUDGE_FACTOR)
        notifications = getProp()
        expect(callCount).toBe(3)
        expect(notifications.extensions.polling.meta.isActive()).toBe(false)
    })
})
