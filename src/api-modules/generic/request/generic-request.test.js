import {
    beforeRequest,
    afterRequest,
    getRequestParameters,
    defaultHeaders,
} from './index'

describe('Generic Request', () => {
    describe('getRequestParameters', () => {
        it('should return the headers passed to it', () => {
            expect(
                getRequestParameters('', {
                    declaration: { headers: { 'X-Request': true } },
                }),
            ).toEqual({
                headers: { 'X-Request': true },
            })
        })

        it('should return default headers if none are passed in', () => {
            expect(getRequestParameters().headers).toBe(defaultHeaders)
        })
    })

    describe('before and after request', () => {
        it('should just resolve a promise', async () => {
            expect(await beforeRequest()).toBeUndefined()
            expect(await afterRequest()).toBeUndefined()
        })
    })
})
