const areMergedPropsEqual = require('./should-rerender').areMergedPropsEqual

const defineDataProperty = (obj, key, value) => {
    Object.defineProperty(obj, key, {
        value,
        enumerable: false,
    })
}

describe('nion: should-rerender', () => {
    describe('when there are extra or different top-level keys on nion', () => {
        describe('that are significant', () => {
            it('should return false', () => {
                let prevProps = { user: {} }
                let nextProps = {}
                expect(
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
                ).toEqual(false)

                prevProps = { user: {} }
                nextProps = { post: {} }
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
                const keysToIgnore = [
                    '_initializeDataKey',
                    'updateEntity',
                    '_declarations',
                ]
                keysToIgnore.forEach(key => {
                    const prevProps = { [key]: 'foo', user: {} }
                    const nextProps = { user: {} }
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
            let prevProps = { user: {} }
            defineDataProperty(prevProps.user, 'foo', 'bar')
            let nextProps = { user: {} }
            expect(
                areMergedPropsEqual({ nion: prevProps }, { nion: nextProps }),
            ).toEqual(false)

            prevProps = { user: {} }
            defineDataProperty(prevProps.user, 'foo', 'bar')
            nextProps = { user: {} }
            defineDataProperty(nextProps.user, 'foo', 'baz')
            expect(
                areMergedPropsEqual({ nion: prevProps }, { nion: nextProps }),
            ).toEqual(false)

            prevProps = { user: {} }
            defineDataProperty(prevProps.user, 'foo', 'bar')
            nextProps = { user: {} }
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
                let prevProps = { user: {} }
                defineDataProperty(prevProps.user, 'request', {
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                let nextProps = { user: {} }
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

                prevProps = { user: {} }
                defineDataProperty(prevProps.user, 'request', {
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                nextProps = { user: {} }
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

                prevProps = { user: {} }
                defineDataProperty(prevProps.user, 'request', {
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                nextProps = { user: {} }
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
                let prevProps = { user: {} }
                defineDataProperty(prevProps.user, 'request', {
                    status: 'pending',
                    fetchedAt: aTimestamp,
                })
                let nextProps = { user: {} }
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
        describe('when there are no entities in either', () => {
            it('should return true', () => {
                let prevProps = { user: {} }
                defineDataProperty(prevProps.user, 'allObjects', {})
                let nextProps = { user: {} }
                defineDataProperty(nextProps.user, 'allObjects', {})
                expect(
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
                ).toEqual(true)
            })
        })

        describe('when there are a different number of entities', () => {
            it('should return false', () => {
                let prevProps = { user: {} }
                defineDataProperty(prevProps.user, 'allObjects', {})
                let nextProps = { user: {} }
                defineDataProperty(nextProps.user, 'allObjects', {
                    user: {
                        ['123']: {
                            type: 'user',
                            id: '123',
                            name: 'Jane',
                        },
                    },
                })
                expect(
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
                ).toEqual(false)
            })
        })

        describe('when the entities have different types or IDs', () => {
            it('should return false', () => {
                let prevProps = { user: {} }
                defineDataProperty(prevProps.user, 'allObjects', {
                    user: {
                        ['123']: {
                            type: 'user',
                            id: '123',
                            name: 'Jane',
                        },
                    },
                })
                let nextProps = { user: {} }
                defineDataProperty(nextProps.user, 'allObjects', {
                    user: {
                        ['456']: {
                            type: 'user',
                            id: '456',
                            name: 'Jane',
                        },
                    },
                })
                expect(
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
                ).toEqual(false)
            })
        })

        describe('when the entities have different attributes', () => {
            it('should return false', () => {
                let prevProps = { user: {} }
                defineDataProperty(prevProps.user, 'allObjects', {
                    user: {
                        ['123']: {
                            type: 'user',
                            id: '123',
                            name: 'Jane',
                        },
                    },
                })
                let nextProps = { user: {} }
                defineDataProperty(nextProps.user, 'allObjects', {
                    user: {
                        ['123']: {
                            type: 'user',
                            id: '123',
                            name: 'John',
                        },
                    },
                })
                expect(
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
                ).toEqual(false)
            })
        })

        describe('when all the entities are fully identical', () => {
            it('should return true', () => {
                let prevProps = { user: {} }
                defineDataProperty(prevProps.user, 'allObjects', {
                    user: {
                        ['123']: {
                            type: 'user',
                            id: '123',
                            name: 'Jane',
                        },
                    },
                })
                let nextProps = { user: {} }
                defineDataProperty(nextProps.user, 'allObjects', {
                    user: {
                        ['123']: {
                            type: 'user',
                            id: '123',
                            name: 'Jane',
                        },
                    },
                })
                expect(
                    areMergedPropsEqual(
                        { nion: prevProps },
                        { nion: nextProps },
                    ),
                ).toEqual(true)
            })

            describe('when there are a few entities with relationships in there', () => {
                it.only('should still return true', () => {
                    let prevProps = { user: {} }
                    defineDataProperty(prevProps.user, 'allObjects', {
                        user: {
                            ['123']: {
                                type: 'user',
                                id: '123',
                                name: 'Jane',
                                friend: {
                                    props: 'in',
                                    here: 'are',
                                    ignored: 'for performance',
                                    _ref: { type: 'user', id: '456' },
                                },
                            },
                            ['456']: {
                                type: 'user',
                                id: '456',
                                name: 'John',
                            },
                        },
                    })
                    let nextProps = { user: {} }
                    defineDataProperty(nextProps.user, 'allObjects', {
                        user: {
                            ['123']: {
                                type: 'user',
                                id: '123',
                                name: 'Jane',
                                friend: {
                                    _ref: { type: 'user', id: '456' },
                                },
                            },
                            ['456']: {
                                type: 'user',
                                id: '456',
                                name: 'John',
                            },
                        },
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
    })
})
