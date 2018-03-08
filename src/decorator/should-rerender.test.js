import Immutable from 'seamless-immutable'
const areMergedPropsEqual = require('./should-rerender').areMergedPropsEqual

const makeDataObject = (data = {}) => {
    return { data: Immutable({ type: 'test', id: '123', ...data }) }
}

describe('nion: should-rerender', () => {
    describe('when there are extra or different top-level keys on nion', () => {
        describe('that are significant', () => {
            it('should return false', () => {
                let prevProps = { user: makeDataObject() }
                let nextProps = {}
                expect(
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
                ).toEqual(false)

                prevProps = { user: makeDataObject() }
                nextProps = { post: makeDataObject() }
                expect(
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
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
                            { nion: prevProps },
                            { nion: nextProps },
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
                areMergedPropsEqual({ nion: prevProps }, { nion: nextProps }),
            ).toEqual(false)

            prevProps = { user: makeDataObject({ foo: 'bar' }) }
            nextProps = { user: makeDataObject({ foo: 'baz' }) }
            expect(
                areMergedPropsEqual({ nion: prevProps }, { nion: nextProps }),
            ).toEqual(false)

            prevProps = { user: makeDataObject({ foo: 'bar' }) }
            nextProps = { user: makeDataObject({ baz: 'biz' }) }
            expect(
                areMergedPropsEqual({ nion: prevProps }, { nion: nextProps }),
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
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
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
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
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
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
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
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
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
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
                ).toEqual(false)
            })
        })

        describe('when the denormalized data objects are equal', () => {
            it('should return true', () => {
                const user = makeDataObject({ name: 'test' })
                let prevProps = { user: user }
                let nextProps = { user: user }
                expect(
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
                ).toEqual(true)
            })
        })

        describe('when the denormalized data objects are not equal', () => {
            it('should return false', () => {
                let prevProps = { user: makeDataObject({ name: 'test' }) }
                let nextProps = { user: makeDataObject({ name: 'other' }) }

                expect(
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
                ).toEqual(false)
            })
        })
    })

    describe('extra data', () => {
        describe('when the extra data is all the same', () => {
            it.only('should return true', () => {
                let prevProps = { user: makeDataObject() }
                prevProps.user.extra = {
                    links: { self: '' },
                    meta: { count: 25 },
                }

                let nextProps = { user: makeDataObject() }
                nextProps.user.extra = {
                    links: { self: '' },
                    meta: { count: 25 },
                }

                expect(
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
                ).toEqual(true)
            })
        })
    })

    describe('extensions metadata', () => {
        // TODO: test `nion[key].extensions[extensionName].meta` comparisons
    })
})
