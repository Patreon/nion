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
            it('should return false', () => {
                let prevProps = { user: makeDataObject() }
                let nextProps = {}
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(false)

                prevProps = { user: makeDataObject() }
                nextProps = { post: makeDataObject() }
                expect(passedPropsAreEqual(prevProps, nextProps)).toEqual(false)
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(false)
            })
        })

        describe('that are ignored', () => {
            it('should return true', () => {
                const user = makeDataObject()
                const keysToIgnore = [
                    '_initializeDataKey',
                    'updateEntity',
                    '_declarations',
                ]
                keysToIgnore.forEach(key => {
                    const prevProps = {
                        [key]: 'foo',
                        user,
                    }
                    const nextProps = { user }
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
                let prevProps = { user: makeDataObject() }
                prevProps.user.request = Immutable({
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                let nextProps = { user: makeDataObject() }
                nextProps.user.request = Immutable({
                    status: 'success',
                    fetchedAt: aLaterTimestamp,
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

                prevProps = { user: makeDataObject() }
                prevProps.user.request = Immutable({
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                nextProps = { user: makeDataObject() }
                nextProps.user.request = Immutable({
                    status: 'pending',
                    fetchedAt: aLaterTimestamp,
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

                prevProps = { user: makeDataObject() }
                prevProps.user.request = Immutable({
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                nextProps = { user: makeDataObject() }
                nextProps.user.request = Immutable({
                    status: 'success',
                    fetchedAt: aTimestamp,
                })
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(false)
            })
        })

        describe('when the requests all have the same status and timestamps', () => {
            it('should return true', () => {
                let user = makeDataObject()
                let prevProps = { user }
                prevProps.user.request = Immutable({
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                let nextProps = { user }
                nextProps.user.request = Immutable({
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(true)
            })
        })
    })

    describe('entity data', () => {
        describe('when the denormalized data object is empty', () => {
            it('should return false', () => {
                let prevProps = { user: makeDataObject({ _exists: false }) }
                let nextProps = { user: makeDataObject({ _exists: false }) }
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(false)
            })
        })

        describe('when the denormalized data objects are equal', () => {
            const user = makeDataObject({ name: 'test' })
            let prevProps = { user: user }
            let nextProps = { user: user }

            it('should return true', () => {
                expect(
                    areMergedPropsEqual(nionize(prevProps), nionize(nextProps)),
                ).toEqual(true)
            })
            it('should pass a dataAreEqual check', () => {
                expect(
                    dataAreEqual(prevProps.data, nextProps.data)
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
                expect(dataAreEqual(prevProps.data, nextProps.data)).toBeFalsy()
            })
        })
    })

    describe('extra data', () => {
        describe('when the extra data is all the same', () => {
            const extraLinks = { self: '' }
            const extraMeta = { count: 25 }

            let prevProps = { user: makeDataObject() }
            prevProps.user.extra = {
                links: extraLinks,
                meta: extraMeta,
            }

            let nextProps = { user: makeDataObject() }
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
            let extraLinks = { self: '' }
            const extraMeta = { count: 25 }

            let prevProps = { user: makeDataObject() }
            prevProps.user.extra = {
                links: extraLinks,
                meta: extraMeta,
            }

            let nextProps = { user: makeDataObject() }
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
            let extraLinks = { self: '' }
            const extraMeta = { count: 25 }

            let prevProps = { user: makeDataObject() }
            prevProps.user.extra = {
                links: extraLinks,
                meta: extraMeta,
            }

            let nextProps = { user: makeDataObject() }
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
