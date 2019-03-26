/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react'
import { act } from 'react-dom/test-utils'
import { mount } from 'enzyme'
import nock from 'nock'
import P from 'bluebird'

import { useNion, makeRef } from '../src/index'

import { StoreContext } from 'redux-react-hook'
import configureTestStore from './configure-test-store'

const Wrap = (Wrapped, props) => {
    const store = configureTestStore()
    return (
        <StoreContext.Provider value={store}>
            <Wrapped {...props} />
        </StoreContext.Provider>
    )
}

const baseUrl = 'http://api.test.com'
const buildUrl = path =>
    path.startsWith('/') ? baseUrl + path : baseUrl + '/' + path

describe('nion hooks: integration tests', () => {
    afterEach(() => {
        nock.cleanAll()
    })

    describe('nion decorator', () => {
        it('injects props into the component', async () => {
            function Container() {
                const returned = useNion({
                    dataKey: 'test',
                    endpoint: buildUrl('/test'),
                })
                return <div returned={returned} />
            }

            const Wrapper = mount(Wrap(Container))
            const Wrapped = Wrapper.find('div')

            const returned = Wrapped.prop('returned')

            expect(returned).toBeDefined()
            expect(returned[0]).toBeDefined()

            // Test the expected nion dataProp API interface
            const [test, actions, request] = returned

            // Actions
            expect(actions.get).toBeDefined()
            expect(actions.post).toBeDefined()
            expect(actions.patch).toBeDefined()
            expect(actions.delete).toBeDefined()

            // Request
            expect(request).toBeDefined()
            expect(request.status).toEqual('not called')

            // Data
            expect(test).toBeNull()

            // Advanced features
            expect(actions.updateRef).toBeDefined()
            expect(actions.updateEntity).toBeDefined()
        })

        it('gets data on demand', async () => {
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

            function Container() {
                const returned = useNion({ dataKey: 'test', endpoint })
                return <div returned={returned} />
            }

            const Wrapper = mount(Wrap(Container))

            const getProp = () => {
                act(() => {
                    Wrapper.update()
                })
                return Wrapper.find('div').prop('returned')
            }

            let [test, actions, request] = getProp()

            let waitingFor

            act(() => {
                waitingFor = actions.get()
            })

            await P.delay(0) // wait for useEffect to go
            ;[test, actions, request] = getProp()
            expect(request.status).toEqual('pending')
            expect(request.isLoading).toEqual(true)

            await waitingFor
            ;[test, actions, request] = getProp()
            expect(request.status).toEqual('success')
            expect(test.name).toEqual(name)
        })

        it('fetches data on mount', async () => {
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

            function Container() {
                const returned = useNion({
                    dataKey: 'test',
                    endpoint,
                    fetchOnMount: true,
                })
                return <div returned={returned} />
            }

            const Wrapper = mount(Wrap(Container))

            const getProp = () =>
                Wrapper.update()
                    .find('div')
                    .prop('returned')

            await P.delay(15) // Wait 15ms for the request reducer to update

            const [test, _, request] = getProp()
            expect(request.status).toEqual('success')
            expect(test.name).toEqual(name)
        })

        it('patches data', async () => {
            const pathname = 'test'
            const name = 'Testy McTestFace'
            const newName = 'Nion McNionFace'

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

            nock(endpoint)
                .patch('')
                .query(true)
                .reply(200, {
                    data: {
                        id: 123,
                        type: 'animal',
                        attributes: { name: newName },
                    },
                })

            function Container() {
                const returned = useNion({ dataKey: 'test', endpoint })
                return <div returned={returned} />
            }

            const Wrapper = mount(Wrap(Container))

            const getProp = () =>
                Wrapper.update()
                    .find('div')
                    .prop('returned')

            let [test, actions, request] = getProp()
            let waitingFor = actions.get()

            ;[test, actions, request] = getProp()
            expect(request.status).toEqual('pending')
            expect(request.isLoading).toEqual(true)

            await waitingFor

            ;[test, actions, request] = getProp()
            expect(request.status).toEqual('success')
            expect(test.name).toEqual(name)

            // Patch request
            waitingFor = actions.patch()

            ;[test, actions, request] = getProp()
            expect(request.status).toEqual('pending')
            expect(request.isLoading).toEqual(true)

            await waitingFor

            ;[test, actions, request] = getProp()
            expect(request.status).toEqual('success')
            expect(test.name).toEqual(newName)
        })

        it('deletes data', async () => {
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

            nock(endpoint)
                .delete('')
                .query(true)
                .reply(204)

            function Container() {
                const returned = useNion({ dataKey: 'test', endpoint })
                return <div returned={returned} />
            }

            const Wrapper = mount(Wrap(Container))

            const getProp = () =>
                Wrapper.update()
                    .find('div')
                    .prop('returned')

            let [test, actions, request] = getProp()
            let waitingFor = actions.get()

            await P.delay(0)

            ;[test, actions, request] = getProp()
            expect(request.status).toEqual('pending')
            expect(request.isLoading).toEqual(true)

            await waitingFor

            ;[test, actions, request] = getProp()
            expect(request.status).toEqual('success')
            expect(test.name).toEqual(name)

            // Delete request
            await actions.delete()

            ;[test, actions, request] = getProp()
            expect(request.status).toEqual('success')

            expect(!!test).toEqual(false)
        })

        it('handles an error', async () => {
            const pathname = 'test'

            const endpoint = buildUrl(pathname)
            nock(endpoint)
                .get('')
                .delay(2000)
                .query(true)
                .reply(404)

            function Container() {
                const returned = useNion({ dataKey: 'test', endpoint })
                return <div returned={returned} />
            }

            const Wrapper = mount(Wrap(Container))

            const getProp = () =>
                Wrapper.update()
                    .find('div')
                    .prop('returned')

            let [test, actions, request] = getProp()
            let waitingFor = actions.get()

            await waitingFor.catch(err => {
                expect(err).toBeInstanceOf(Error)
            })

            ;[test, actions, request] = getProp()
            expect(request.status).toEqual('error')
            expect(request.isError).toEqual(true)
            expect(request.isLoading).toEqual(false)
        })

        it('handles optimistic updates', async () => {
            const pathname = 'test'
            const name = 'Testy McTestFace'
            const newName = 'Nion McNionFace'

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

            function Container() {
                const returned = useNion({ dataKey: 'test', endpoint })
                return <div returned={returned} />
            }

            const Wrapper = mount(Wrap(Container))

            const getProp = () =>
                Wrapper.update()
                    .find('div')
                    .prop('returned')

            let [test, actions, request] = getProp()
            let waitingFor = actions.get()

            ;[test, actions, request] = getProp()
            expect(request.status).toEqual('pending')
            expect(request.isLoading).toEqual(true)

            await waitingFor

            ;[test, actions, request] = getProp()
            expect(request.status).toEqual('success')
            expect(test.name).toEqual(name)

            // Optimistic Update

            ;[test, actions, request] = getProp()
            actions.updateEntity(
                {
                    type: 'animal',
                    id: 123,
                },
                {
                    name: newName,
                },
            )

            ;[test, actions, request] = getProp()
            expect(test.name).toEqual(newName)
        })

        it('creates children with initial refs', async () => {
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

            function Container(props) {
                const returned = useNion({
                    dataKey: 'child',
                    endpoint: buildUrl(pathname),
                    initialRef: makeRef(props.inputData),
                },)
                return <div returned={returned} />
            }


            @nion({ test: { endpoint: buildUrl(pathname) } })
            class Container extends Component {
                render() {
                    const { test } = this.props.nion
                    return exists(test) ? (
                        <ChildContainer inputData={test.data} />
                    ) : (
                        <span />
                    )
                }
            }

            const Wrapper = mount(Wrap(Container))

            let getProp = () =>
                Wrapper.update()
                    .find('Container')
                    .props().nion.test

            let test = getProp()
            let request = test.actions.get()

            test = getProp()
            expect(test.request.status).toEqual('pending')
            expect(test.request.isLoading).toEqual(true)

            let ChildWrapped = Wrapper.update().find('ChildContainer')
            expect(ChildWrapped.exists()).toEqual(false)

            await request

            test = getProp()
            expect(test.request.status).toEqual('success')
            expect(test.data.name).toEqual(name)

            // Child component
            ChildWrapped = Wrapper.update().find('ChildContainer')

            getProp = () => ChildWrapped.props().nion.child

            let child = getProp()
            expect(exists(child)).toEqual(true)
        })
    })
})
