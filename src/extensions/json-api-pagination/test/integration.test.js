/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react'
import { mount } from 'enzyme'
import nock from 'nock'

import nion from '../../../'

import { Provider } from 'react-redux'
import configureTestStore from '../../../../test/configure-test-store'

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

describe('JSON API Pagination extension', () => {
    afterEach(() => {
        nock.cleanAll()
    })

    test(`doesn't mutate resources with no pagination links`, async () => {
        const endpoint = buildUrl(`user/fredrogers`)

        nock(endpoint)
            .get('')
            .query(true)
            .reply(200, {})

        @nion({
            user: {
                endpoint,
                extensions: { jsonApiPagination: {} },
            },
        })
        class Container extends Component {
            render() {
                return null
            }
        }

        const Wrapper = mount(Wrap(Container))
        const Wrapped = Wrapper.find('Container')

        const getProp = () => Wrapped.props().nion.user

        let user = getProp()
        let request = user.actions.get()

        await request

        user = getProp()

        expect(user.request.status).toEqual('success')
        expect(user.request.isLoading).toEqual(false)

        expect(user.actions.next).toBeUndefined()
        expect(user.actions.prev).toBeUndefined()
        expect(user.actions.first).toBeUndefined()
        expect(user.actions.last).toBeUndefined()

        expect(user.extra.canLoadMore).toBeFalsey
    })

    test(`adds actions and meta to resources with pagination links`, async () => {
        const endpoint = buildUrl(`pages/1`)
        const nextPage = buildUrl(`pages/2`)

        nock(endpoint)
            .get('')
            .query(true)
            .reply(200, {
                data: [],
                links: {
                    next: nextPage,
                },
            })

        @nion({
            page: {
                endpoint,
                extensions: { jsonApiPagination: {} },
            },
        })
        class Container extends Component {
            render() {
                return null
            }
        }

        const Wrapper = mount(Wrap(Container))
        const Wrapped = Wrapper.find('Container')

        const getProp = () => Wrapped.props().nion.page

        let page = getProp()
        let request = page.actions.get()

        await request

        page = getProp()

        expect(page.request.status).toEqual('success')
        expect(page.request.isLoading).toEqual(false)

        expect(page.actions.next).toBeDefined()
        expect(page.extra.canLoadMore).toEqual(true)
    })
})
