import Immutable from 'seamless-immutable'
import {
    areMergedPropsEqual,
    passedPropsAreEqual,
    requestsAreEqual,
    extrasAreEqual,
    extensionsAreEqual,
    dataAreEqual,
} from './should-rerender.js'

const makeDataObject = (data = {}) => {
    return { data: Immutable({ type: 'test', id: '123', ...data }) }
}

const nionize = obj => ({ nion: obj })

describe('nion: should-rerender', () => {
    describe('when there are extra or different top-level keys on nion', () => {
        describe('that are significant', () => {
            const data = makeDataObject()
            let prevProps = { user: { data } }
            let nextProps = {}
            it('should return false', () => {
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(false)
            })
            it('should fail a passedPropsAreEqual check', () => {
                expect(passedPropsAreEqual(prevProps, nextProps)).toEqual(false)
            })
        })

        describe('that are ignored', () => {
            it('should return true', () => {
                const data = makeDataObject()
                const keysToIgnore = [
                    '_initializeDataKey',
                    'updateEntity',
                    '_declarations',
                ]
                keysToIgnore.forEach(key => {
                    const prevProps = {
                        user: {
                            [key]: 'foo',
                            data,
                        },
                    }
                    const nextProps = { user: { data } }
                    expect(
                        areMergedPropsEqual(
                            nionize(prevProps),
                            nionize(nextProps),
                        ),
                    ).toEqual(true)
                })
            })
        })
    })

    describe('when there are extra or different keys on the nion resource', () => {
        it('should return false', () => {
            let prevProps = { user: makeDataObject({ foo: 'bar' }) }
            let nextProps = { user: makeDataObject() }

            expect(
                areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
            ).toEqual(false)

            prevProps = { user: makeDataObject({ foo: 'bar' }) }
            nextProps = { user: makeDataObject({ foo: 'baz' }) }
            expect(
                areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
            ).toEqual(false)

            prevProps = { user: makeDataObject({ foo: 'bar' }) }
            nextProps = { user: makeDataObject({ baz: 'biz' }) }
            expect(
                areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
            ).toEqual(false)
        })
    })

    describe('request data', () => {
        const aTimestamp = Date.now()
        const aLaterTimestamp = aTimestamp + 100

        describe('when the requests have different status or timestamps', () => {
            it('should return false', () => {
                const data = makeDataObject()
                let prevProps = { user: { data } }
                prevProps.user.request = Immutable({
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                let nextProps = { user: { data } }
                nextProps.user.request = Immutable({
                    status: 'success',
                    fetchedAt: aLaterTimestamp,
                })
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(false)

                prevProps = { user: { data } }
                prevProps.user.request = Immutable({
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                nextProps = { user: { data } }
                nextProps.user.request = Immutable({
                    status: 'pending',
                    fetchedAt: aLaterTimestamp,
                })
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(false)

                prevProps = { user: { data } }
                prevProps.user.request = Immutable({
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                nextProps = { user: { data } }
                nextProps.user.request = Immutable({
                    status: 'success',
                    fetchedAt: aTimestamp,
                })
                expect(
                    requestsAreEqual(
                        prevProps.user.request,
                        nextProps.user.request,
                    ),
                ).toEqual(false)
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(false)
            })
        })

        describe('when the requests all have the same status and timestamps', () => {
            const data = makeDataObject()
            let prevProps = { user: { data } }
            prevProps.user.request = Immutable({
                status: 'pending',
                fetchedAt: aTimestamp,
            })
            let nextProps = { user: { data } }
            nextProps.user.request = Immutable({
                status: 'pending',
                fetchedAt: aTimestamp,
            })
            it('should return true', () => {
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(true)
            })
            it('should pass a requestsAreEqual check', () => {
                expect(
                    requestsAreEqual(
                        prevProps.user.request,
                        nextProps.user.request,
                    ),
                ).toBe(true)
            })
        })
    })

    describe('entity data', () => {
        describe('when the denormalized data object is empty', () => {
            let prevProps = { user: makeDataObject({ _exists: false }) }
            let nextProps = { user: makeDataObject({ _exists: false }) }
            it('should return false', () => {
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(false)
            })
            it('should fail a dataAreEqual check', () => {
                expect(
                    dataAreEqual(prevProps.user.data, nextProps.user.data),
                ).toBe(false)
            })
        })

        describe('when the denormalized data objects are equal', () => {
            const data = makeDataObject({ name: 'test' })
            let prevProps = { user: { data } }
            let nextProps = { user: { data } }

            it('should return true', () => {
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(true)
            })
            it('should pass a dataAreEqual check', () => {
                expect(
                    dataAreEqual(prevProps.user.data, nextProps.user.data),
                ).toBe(true)
            })
        })

        describe('when the denormalized data objects are not equal', () => {
            let prevProps = { user: makeDataObject({ name: 'test' }) }
            let nextProps = { user: makeDataObject({ name: 'other' }) }

            it('should return false', () => {
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(false)
            })
            it('should fail a dataAreEqual check', () => {
                expect(
                    dataAreEqual(prevProps.user.data, nextProps.user.data),
                ).toBeFalsy()
            })
        })
    })

    describe('extra data', () => {
        describe('when the extra data is all the same', () => {
            const data = makeDataObject({ name: 'test' })
            const extraLinks = { self: '' }
            const extraMeta = { count: 25 }

            let prevProps = { user: { data } }
            prevProps.user.extra = {
                links: extraLinks,
                meta: extraMeta,
            }

            let nextProps = { user: { data } }
            nextProps.user.extra = {
                links: extraLinks,
                meta: extraMeta,
            }

            it('should return true', () => {
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(true)
            })
            it('should pass an extrasAreEqual check', () => {
                expect(
                    extrasAreEqual(prevProps.user.extra, nextProps.user.extra),
                ).toEqual(true)
            })
        })

        describe('when the extra data has changed', () => {
            const data = makeDataObject({ name: 'test' })
            let extraLinks = { self: '' }
            const extraMeta = { count: 25 }

            let prevProps = { user: { data } }
            prevProps.user.extra = {
                links: extraLinks,
                meta: extraMeta,
            }

            let nextProps = { user: { data } }
            extraLinks = { self: 'http://link.to.self' }
            nextProps.user.extra = {
                links: extraLinks,
                meta: extraMeta,
            }

            it('should return false', () => {
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(false)
            })
            it('should fail an extrasAreEqual check', () => {
                expect(
                    extrasAreEqual(prevProps.user.extra, nextProps.user.extra),
                ).toEqual(false)
            })
        })

        describe('when the extra data has new keys', () => {
            const data = makeDataObject({ name: 'test' })
            let extraLinks = { self: '' }
            const extraMeta = { count: 25 }

            let prevProps = { user: { data } }
            prevProps.user.extra = {
                links: extraLinks,
                meta: extraMeta,
            }

            let nextProps = { user: { data } }
            extraLinks = {
                self: 'http://link.to.self',
                next: 'http://link.to.next',
            }
            nextProps.user.extra = {
                links: extraLinks,
                meta: extraMeta,
            }

            it('should return false', () => {
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(false)
            })
            it('should fail an extrasAreEqual check', () => {
                expect(
                    extrasAreEqual(prevProps.user.extra, nextProps.user.extra),
                ).toEqual(false)
            })
        })
    })

    describe('extensions metadata', () => {
        // TODO: test `nion[key].extensions[extensionName].meta` comparisons
    })
})
