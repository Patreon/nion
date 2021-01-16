/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React, { useEffect, useRef } from 'react'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import nock from 'nock'
import P from 'bluebird'

import { useNion, makeRef, exists } from '../src/index'

import { StoreContext } from 'redux-react-hook'
import configureTestStore from './configure-test-store'

export function useDebug(deps) {
    const prev = useRef([])

    useEffect(() => {
        const returned = deps

        prev.current.length
            ? returned.forEach(
                  (r, i) =>
                      r !== prev.current[i] &&
                      console.log('r !== p[i]', r, prev.current[i], i),
              )
            : 'initial render'
        prev.current = returned
        // eslint-disable-next-line
    }, deps)
}

const Wrap = (Wrapped, props) => {
    const store = configureTestStore()
    return (
        <Provider store={store}>
            <StoreContext.Provider value={store}>
                <Wrapped {...props} />
            </StoreContext.Provider>
        </Provider>
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

            let [_test, actions, request] = getProp()
            let waitingFor = actions.get()

            await waitingFor.catch(err => {
                expect(err).toBeInstanceOf(Error)
            })
            ;[_test, actions, request] = getProp()
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
            act(() => {
                actions.updateEntity(
                    {
                        type: 'animal',
                        id: 123,
                    },
                    {
                        name: newName,
                    },
                )
            })
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

            function ChildContainer(props) {
                const returned = useNion(
                    {
                        dataKey: 'child',
                        endpoint: endpoint,
                        initialRef: makeRef(props.inputData),
                    },
                    [props.inputData],
                )
                return <div returned={returned} />
            }

            function Container(props) {
                const [test, actions] = useNion({
                    dataKey: 'test',
                    endpoint: endpoint,
                })

                // useDebug([actions])
                useEffect(() => {
                    actions.get()
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [])
                return test ? <ChildContainer inputData={test} /> : <span />
            }

            const Wrapper = mount(Wrap(Container))
            await P.delay(50)

            // // Child component
            const ChildWrapped = Wrapper.update().find('div')

            const getProp = () => ChildWrapped.prop('returned')

            await P.delay(20)

            act(() => {
                Wrapper.update()
            })

            await P.delay(1)

            let child = getProp()

            expect(exists(child[0])).toEqual(true)
        })
    })
})

describe('hooks re-render performance', () => {
    let numRenders
    beforeEach(() => {
        numRenders = 0
    })

    it('should only render once per action with minimal config', async () => {
        function Container() {
            const returned = useNion({
                dataKey: 'test',
                endpoint: buildUrl('/test'),
            })

            numRenders++
            return <div returned={returned} />
        }
        let wrapped
        act(() => {
            wrapped = mount(Wrap(Container))
        })

        // 1 for change to state and 1 for the initial render
        expect(numRenders).toBe(2)

        const [data1, actions] = wrapped.find('div').prop('returned')

        const endpoint = buildUrl('/test')
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

        let a

        act(() => {
            a = actions.get()
        })

        const [data2, actions2] = wrapped.find('div').prop('returned')

        expect(data2).toBe(data1)
        expect(actions).toBe(actions2)

        expect(numRenders).toBe(3)

        await a
        await P.delay(1)

        expect(numRenders).toBe(4)

        const [, actions3] = wrapped.find('div').prop('returned')

        expect(actions3).toBe(actions2)
    })
})
