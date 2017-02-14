/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react'
import { withProps } from 'recompose'
import { mount } from 'enzyme'
import nock from 'nock'
import P from 'bluebird'

import nion, { buildUrl } from '../index'

import { Provider } from 'react-redux'
import configureTestStore from 'shared/configure-store/test'

const storeOptions = {
    nion: true
}

const Wrap = (Wrapped) => {
    const store = configureTestStore({}, storeOptions)
    return (
        <Provider store={ store }>
            <Wrapped />
        </Provider>
    )
}

describe('nion : integration tests', () => {
    afterEach(() => {
        nock.cleanAll()
    })

    describe('nion decorator', () => {
        it('injects props into the component', async () => {
            @nion({ test: {
                endpoint: '/test'
            }})
            class Container extends Component {
                render() { return null }
            }

            const Wrapper = mount(Wrap(Container))
            const Wrapped = Wrapper.find('Container')

            const props = Wrapped.props()

            expect(props.nion).toBeDefined()
            expect(props.nion.test).toBeDefined()

            // Test the expected nion dataProp API interface
            const { test } = props.nion

            // Actions
            expect(test.actions.get).toBeDefined()
            expect(test.actions.post).toBeDefined()
            expect(test.actions.patch).toBeDefined()
            expect(test.actions.delete).toBeDefined()

            // Request
            expect(test.request).toBeDefined()
            expect(test.request.status).toEqual('not called')

            // Data
            expect(test.id).toBeUndefined()
            expect(test.type).toBeUndefined()

            // Advanced features
            expect(test.actions.updateRef).toBeDefined()
            expect(props.nion.updateEntity).toBeDefined()
        })

        it('uses input props to populate declarations', async () => {
            @withProps({ id: 123 })
            @nion(({ id }) => ({
                test: {
                    endpoint: `test/${id}`
                }
            }))
            class Container extends Component {
                render() { return null }
            }

            const Wrapper = mount(Wrap(Container))
            const Wrapped = Wrapper.find('Container')

            const declarations = Wrapped.props().nion.getDeclarations()
            expect(declarations.test.endpoint).toEqual('test/123')
        })

        it('gets data on demand', async () => {
            const pathname = 'test'
            const name = 'Testy McTestFace'

            const endpoint = buildUrl(pathname)
            nock(endpoint).get('').query(true).reply(200, { data: {
                id: 123,
                type: 'animal',
                attributes: { name }
            }})

            @nion({ test: { endpoint: pathname } })
            class Container extends Component {
                render() {
                    return null
                }
            }

            const Wrapper = mount(Wrap(Container))
            const Wrapped = Wrapper.find('Container')

            const getProp = () => Wrapped.props().nion.test

            let test = getProp()
            const request = test.actions.get()
            await P.delay(5) // Wait 5ms for the request reducer to update

            test = getProp()
            expect(test.request.status).toEqual('pending')
            expect(test.request.isLoading).toEqual(true)

            await request

            test = getProp()
            expect(test.request.status).toEqual('success')
            expect(test.name).toEqual(name)
        })

        it('fetches data on mount', async () => {
            const pathname = 'test'
            const name = 'Testy McTestFace'

            const endpoint = buildUrl(pathname)
            nock(endpoint).get('').query(true).reply(200, { data: {
                id: 123,
                type: 'animal',
                attributes: { name }
            }})

            @nion({ test: {
                endpoint: pathname,
                fetchOnInit: true
            } })
            class Container extends Component {
                render() {
                    return null
                }
            }

            const Wrapper = mount(Wrap(Container))
            const Wrapped = Wrapper.find('Container')

            const getProp = () => Wrapped.props().nion.test

            // Wait until the request reducer has been updated
            while (getProp().request.status === 'not called') {
                await P.delay(1) // Wait 5ms for the request reducer to update
            }

            let test = getProp()
            expect(test.request.status).toEqual('pending')
            expect(test.request.isLoading).toEqual(true)

            await P.delay(15) // Wait 15ms for the request reducer to update

            test = getProp()
            expect(test.request.status).toEqual('success')
            expect(test.name).toEqual(name)
        })
    })
})
