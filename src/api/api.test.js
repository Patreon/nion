import { ApiManager } from './'
import * as includedApiModules from '../api-modules'

describe('ApiManager', () => {
    /**
     * @type{ApiManager}
     */
    let manager

    describe('with defaults', () => {
        beforeEach(() => {
            manager = new ApiManager()
        })

        it('should add an api module for each included API type', () => {
            expect(Object.keys(manager.apiMap)).toEqual(
                Object.keys(includedApiModules),
            )
        })

        it('should set the default api type', () => {
            expect(manager.defaultApiType).not.toBeNull()
            expect(manager.defaultApiType).toBe('jsonApi')
        })

        describe('getApiModule', () => {
            it('should get a default API', () => {
                expect(manager.getApiModule()).toBe(includedApiModules.jsonApi)
            })

            it('should allow you to specify an API', () => {
                expect(manager.getApiModule('generic')).toBe(
                    includedApiModules.generic,
                )
            })

            it('should error out if you try to access an apiType that does not exist', () => {
                expect(() => manager.getApiModule('GuyFieriQL')).toThrow()
            })
        })

        describe('getRequestHooks', () => {
            /**
             * @type{{
                    afterRequest: async () => void,
                    beforeRequest: async () => void
                }}
             */
            let mockValue
            beforeEach(() => {})
            it('should return the before and after request hooks', () => {
                mockValue = {
                    afterRequest: jest.fn(),
                    beforeRequest: jest.fn(),
                }
                manager.getApiModule = jest
                    .fn()
                    .mockReturnValue({ request: { ...mockValue } })
                expect(manager.getRequestHooks('jsonApi')).toEqual(mockValue)
            })

            it('should return a default value if no hook is provided', async () => {
                manager.getApiModule = jest
                    .fn()
                    .mockReturnValue({ request: {} })

                const requestHooks = manager.getRequestHooks('jsonApi')

                expect(manager.getApiModule).toHaveBeenCalled()

                expect(typeof requestHooks.afterRequest).toBe('function')
                expect(await requestHooks.afterRequest()).toBeUndefined()
                expect(typeof requestHooks.beforeRequest).toBe('function')
                expect(await requestHooks.beforeRequest()).toBeUndefined()
            })
        })

        describe('setDefaultApi', () => {
            it('should set it to the correct API if applicable', () => {
                manager.setDefaultApi('generic')
                expect(manager.defaultApiType).toBe('generic')
            })

            it('should set the default api to a value, if no name is provided', () => {
                manager.defaultApiType = null
                manager.setDefaultApi()
                expect(manager.defaultApiType).not.toBeNull()
            })
        })
    })
})
