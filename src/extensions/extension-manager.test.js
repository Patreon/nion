import ExtensionManager from './'
import configure from '../configure'
import { polling, jsonApiPagination } from './manifest'

const minimalExtensionShape = {
    composeActions: jest.fn(),
    composeMeta: jest.fn(),
}
const minimalExtensionMatcher = {
    composeActions: expect.any(Function),
    composeMeta: expect.any(Function),
}

describe('ExtensionManager', () => {
    describe('registerExtension', () => {
        test('should throw a validation error for non-extension objects', () => {
            const badRegistration = () =>
                ExtensionManager.registerExtension('stuff', {})
            expect(badRegistration).toThrow()
        })

        test('should add valid extension to internal extensionMap property', () => {
            expect(ExtensionManager.extensionMap).toEqual({})

            ExtensionManager.registerExtension('polling', polling)

            expect(ExtensionManager.extensionMap).toEqual({ polling: polling })
        })
    })

    describe('getExtension', () => {
        beforeAll(() => {
            ExtensionManager.registerExtension('polling', polling)
            ExtensionManager.registerExtension(
                'jsonApiPagination',
                jsonApiPagination,
            )
        })

        test('should return registered extensions by name', () => {
            const pollingExtension = ExtensionManager.getExtension('polling')
            expect(pollingExtension).toMatchObject(minimalExtensionMatcher)
        })

        test('should return named extensions registered through configuration', () => {
            configure({ extensions: { useless: minimalExtensionShape } })
            const useless = ExtensionManager.getExtension('useless')
            expect(useless).toMatchObject(minimalExtensionMatcher)
        })

        test('should throw an error when called with an unregistered extension', () => {
            const ersatz = () => ExtensionManager.getExtension('ersatz')
            expect(ersatz).toThrow()
        })
    })
})
