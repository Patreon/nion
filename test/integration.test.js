/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react'
import { withProps } from 'recompose'
import { mount } from 'enzyme'
import nock from 'nock'
import P from 'bluebird'

import nion, { exists, makeRef } from '../src/index'

import { Provider } from 'react-redux'
import configureTestStore from './configure-test-store'

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

describe('nion : integration tests', () => {
    afterEach(() => {
        nock.cleanAll()
    })

    describe('nion decorator', () => {
        it('injects props into the component', async () => {
            @nion({
                test: {
                    endpoint: buildUrl('/test'),
                },
            })
            class Container extends Component {
                render() {
                    return null
                }
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
                    endpoint: buildUrl(`test/${id}`),
                },
            }))
            class Container extends Component {
                render() {
                    return null
                }
            }

            const Wrapper = mount(Wrap(Container))
            const Wrapped = Wrapper.find('Container')

            const declarations = Wrapped.props().nion.getDeclarations()
            expect(declarations.test.endpoint).toEqual(buildUrl('test/123'))
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

            @nion({ test: { endpoint } })
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

            @nion({
                test: {
                    endpoint,
                    fetchOnInit: true,
                },
            })
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

        it('fetches data from props', async () => {
            const pathname = 'test'
            const name = 'Testy McTestFace'
            const id = 123

            const endpoint = buildUrl(`${pathname}/${id}`)
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

            @nion(props => ({
                test: {
                    endpoint: buildUrl(`${pathname}/${props.id}`),
                    fetchOnInit: true,
                },
            }))
            class Container extends Component {
                render() {
                    return null
                }
            }

            const Wrapper = mount(Wrap(Container, { id }))
            const Wrapped = Wrapper.find('Container')

            const getProp = () => Wrapped.props().nion.test

            // Wait until the request reducer has been updated
            while (getProp().request.status === 'not called') {
                await P.delay(1) // Wait 1ms for the request reducer to update
            }

            let test = getProp()
            expect(test.request.status).toEqual('pending')
            expect(test.request.isLoading).toEqual(true)

            await P.delay(15) // Wait 15ms for the request reducer to update

            test = getProp()
            expect(test.request.status).toEqual('success')
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

            @nion({ test: { endpoint: buildUrl(pathname) } })
            class Container extends Component {
                render() {
                    return null
                }
            }

            const Wrapper = mount(Wrap(Container))
            const Wrapped = Wrapper.find('Container')

            const getProp = () => Wrapped.props().nion.test

            let test = getProp()
            let request = test.actions.get()

            test = getProp()
            expect(test.request.status).toEqual('pending')
            expect(test.request.isLoading).toEqual(true)

            await request

            test = getProp()
            expect(test.request.status).toEqual('success')
            expect(test.name).toEqual(name)

            // Patch request
            request = test.actions.patch()

            test = getProp()
            expect(test.request.status).toEqual('pending')
            expect(test.request.isLoading).toEqual(true)

            await request

            test = getProp()
            expect(test.request.status).toEqual('success')
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

            @nion({ test: { endpoint: buildUrl(pathname) } })
            class Container extends Component {
                render() {
                    return null
                }
            }

            const Wrapper = mount(Wrap(Container))
            const Wrapped = Wrapper.find('Container')

            const getProp = () => Wrapped.props().nion.test

            let test = getProp()
            let request = test.actions.get()

            test = getProp()
            expect(test.request.status).toEqual('pending')
            expect(test.request.isLoading).toEqual(true)

            await request

            test = getProp()
            expect(test.request.status).toEqual('success')
            expect(test.name).toEqual(name)

            // Delete request
            request = test.actions.delete()

            await request

            test = getProp()
            expect(test.request.status).toEqual('success')
            expect(exists(test)).toEqual(false)
        })

        it('handles an error', async () => {
            const pathname = 'test'

            const endpoint = buildUrl(pathname)
            nock(endpoint)
                .get('')
                .delay(2000)
                .query(true)
                .reply(404)

            @nion({ test: { endpoint } })
            class Container extends Component {
                render() {
                    return null
                }
            }

            const Wrapper = mount(Wrap(Container))
            const Wrapped = Wrapper.find('Container')

            const getProp = () => Wrapped.props().nion.test

            let test = getProp()
            let request = test.actions.get()

            await request.catch(err => {
                expect(err).toBeInstanceOf(Error)
            })

            test = getProp()
            expect(test.request.status).toEqual('error')
            expect(test.request.isError).toEqual(true)
            expect(test.request.isLoading).toEqual(false)
        })

        it('handles pagination', async () => {
            const pathname = 'pages'

            const endpoint = buildUrl(`${pathname}/1`)
            const next = buildUrl(`${pathname}/2`)
            nock(endpoint)
                .get('')
                .query(true)
                .reply(200, {
                    data: [
                        {
                            id: 1,
                            type: 'page',
                            attributes: { name: 'A' },
                        },
                    ],
                    links: {
                        next,
                    },
                })

            nock(next)
                .get('')
                .query(true)
                .reply(200, {
                    data: [
                        {
                            id: 2,
                            type: 'page',
                            attributes: { name: 'B' },
                        },
                    ],
                })

            @nion({
                pages: {
                    endpoint,
                    paginated: true,
                },
            })
            class Container extends Component {
                render() {
                    return null
                }
            }

            const Wrapper = mount(Wrap(Container))
            const Wrapped = Wrapper.find('Container')

            const getProp = () => Wrapped.props().nion.pages

            let pages = getProp()
            let request = pages.actions.get()

            await request

            pages = getProp()
            expect(pages.request.status).toEqual('success')
            expect(pages.length).toEqual(1)
            expect(pages.request.isLoading).toEqual(false)

            request = pages.actions.next()

            await request

            pages = getProp()
            expect(pages.request.status).toEqual('success')
            expect(pages.length).toEqual(2)
            expect(pages.request.isLoading).toEqual(false)
            expect(pages.request.canLoadMore).toBeFalsey
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

            @nion({ test: { endpoint: buildUrl(pathname) } })
            class Container extends Component {
                render() {
                    return null
                }
            }

            const Wrapper = mount(Wrap(Container))
            const Wrapped = Wrapper.find('Container')

            const getProp = () => Wrapped.props().nion.test

            let test = getProp()
            let request = test.actions.get()

            test = getProp()
            expect(test.request.status).toEqual('pending')
            expect(test.request.isLoading).toEqual(true)

            await request

            test = getProp()
            expect(test.request.status).toEqual('success')
            expect(test.name).toEqual(name)

            // Optimistic Update

            test = getProp()
            Wrapped.props().nion.updateEntity(
                {
                    type: 'animal',
                    id: 123,
                },
                {
                    name: newName,
                },
            )

            test = getProp()
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

            @nion(props => ({
                child: {
                    endpoint: buildUrl(pathname),
                    initialRef: makeRef(props.inputData),
                },
            }))
            class ChildContainer extends Component {
                render() {
                    return null
                }
            }

            @nion({ test: { endpoint: buildUrl(pathname) } })
            class Container extends Component {
                render() {
                    const { test } = this.props.nion
                    return exists(test) ? (
                        <ChildContainer inputData={test} />
                    ) : (
                        <span />
                    )
                }
            }

            const Wrapper = mount(Wrap(Container))
            const Wrapped = Wrapper.find('Container')

            let getProp = () => Wrapped.props().nion.test

            let test = getProp()
            let request = test.actions.get()

            test = getProp()
            expect(test.request.status).toEqual('pending')
            expect(test.request.isLoading).toEqual(true)

            let ChildWrapped = Wrapped.find('ChildContainer')
            expect(ChildWrapped.exists()).toEqual(false)

            await request

            test = getProp()
            expect(test.request.status).toEqual('success')
            expect(test.name).toEqual(name)

            // Child component
            ChildWrapped = Wrapped.find('ChildContainer')

            getProp = () => ChildWrapped.props().nion.child

            let child = getProp()
            expect(exists(child)).toEqual(true)
        })
    })
})
