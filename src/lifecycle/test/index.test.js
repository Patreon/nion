import { Lifecycle } from '../'

describe('Lifecycle', () => {
    /**
     * @type{Lifecycle}
     */
    let lifecycle

    const method = Symbol('method')
    const dataKey = Symbol('dataKey')
    const request = Symbol('request')
    const response = Symbol('response')
    const meta = Symbol('meta')
    const declaration = Symbol('declaration')
    const error = Symbol('error')
    const props = Symbol('props')

    beforeEach(() => {
        lifecycle = new Lifecycle()
    })

    it('should be able to call all the methods without error', () => {
        expect(() => {
            lifecycle.onRequest(method, dataKey, request, meta, declaration)
        }).not.toThrow()
    })

    it('should call onRequest if set', () => {
        const methods = {
            onRequest: jest.fn(),
        }

        lifecycle.registerMethods(methods)

        lifecycle.onRequest(method, dataKey, request, meta, declaration)

        expect(methods.onRequest).toHaveBeenCalledWith(
            method,
            dataKey,
            request,
            meta,
            declaration,
        )
    })

    it('should call onSuccess if set', () => {
        const methods = {
            onSuccess: jest.fn(),
        }

        lifecycle.registerMethods(methods)

        lifecycle.onSuccess(
            method,
            dataKey,
            request,
            response,
            meta,
            declaration,
        )

        expect(methods.onSuccess).toHaveBeenCalledWith(
            method,
            dataKey,
            request,
            response,
            meta,
            declaration,
        )
    })

    it('should call onFailure if set', () => {
        const methods = {
            onFailure: jest.fn(),
        }

        lifecycle.registerMethods(methods)

        lifecycle.onFailure(method, dataKey, error, meta, declaration)

        expect(methods.onFailure).toHaveBeenCalledWith(
            method,
            dataKey,
            error,
            meta,
            declaration,
        )
    })

    it('should call onDeclare if set', () => {
        const methods = {
            onDeclare: jest.fn(),
        }

        lifecycle.registerMethods(methods)

        lifecycle.onDeclare(declaration, props)

        expect(methods.onDeclare).toHaveBeenCalledWith(declaration, props)
    })
})
