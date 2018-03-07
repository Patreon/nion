import Immutable from 'seamless-immutable'
const areMergedPropsEqual = require('./should-rerender').areMergedPropsEqual

const defineDataProperty = (obj, key, value) => {
    obj.data = obj.data.set(key, value)
}

const makeDataObject = data => {
    return { data: Immutable({ type: 'test', id: '123', ...data }) }
}

describe('nion: should-rerender', () => {
    describe('when there are extra or different top-level keys on nion', () => {
        describe('that are significant', () => {
            it('should return false', () => {
                let prevProps = { user: makeDataObject({}) }
                let nextProps = {}
                expect(
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
                ).toEqual(false)

                prevProps = { user: makeDataObject({}) }
                nextProps = { post: makeDataObject({}) }
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
                const user = makeDataObject({})
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
            let prevProps = { user: makeDataObject({}) }
            defineDataProperty(prevProps.user, 'foo', 'bar')
            let nextProps = { user: makeDataObject({}) }

            expect(
                areMergedPropsEqual({ nion: prevProps }, { nion: nextProps }),
            ).toEqual(false)

            prevProps = { user: makeDataObject({}) }
            defineDataProperty(prevProps.user, 'foo', 'bar')
            nextProps = { user: makeDataObject({}) }
            defineDataProperty(nextProps.user, 'foo', 'baz')
            expect(
                areMergedPropsEqual({ nion: prevProps }, { nion: nextProps }),
            ).toEqual(false)

            prevProps = { user: makeDataObject({}) }
            defineDataProperty(prevProps.user, 'foo', 'bar')
            nextProps = { user: makeDataObject({}) }
            defineDataProperty(nextProps.user, 'baz', 'biz')
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
                let prevProps = { user: makeDataObject({}) }
                defineDataProperty(prevProps.user, 'request', {
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                let nextProps = { user: makeDataObject({}) }
                defineDataProperty(nextProps.user, 'request', {
                    status: 'success',
                    fetchedAt: aLaterTimestamp,
                })
                expect(
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
                ).toEqual(false)

                prevProps = { user: makeDataObject({}) }
                defineDataProperty(prevProps.user, 'request', {
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                nextProps = { user: makeDataObject({}) }
                defineDataProperty(nextProps.user, 'request', {
                    status: 'pending',
                    fetchedAt: aLaterTimestamp,
                })
                expect(
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
                ).toEqual(false)

                prevProps = { user: makeDataObject({}) }
                defineDataProperty(prevProps.user, 'request', {
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                nextProps = { user: makeDataObject({}) }
                defineDataProperty(nextProps.user, 'request', {
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
                let user = makeDataObject({})
                let prevProps = { user }
                defineDataProperty(prevProps.user, 'request', {
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                let nextProps = { user }
                defineDataProperty(nextProps.user, 'request', {
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

    describe('entities', () => {
        describe('when the denormalized object is empty', () => {
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

        describe('when the denormalized objects are equal', () => {
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

        describe('when the denormalized objects are not equal', () => {
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
        // TODO: test `nion[key].extra` comparisons
    })

    describe('extensions metadata', () => {
        // TODO: test `nion[key].extensions[extensionName].meta` comparisons
    })
})
