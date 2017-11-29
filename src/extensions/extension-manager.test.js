import ExtensionManager from './'
import configure from '../configure'

const minimalExtensionObj = {
    generateActions: () => {},
    generateMeta: () => {},
}
const minimalExtensionMatcher = {
    generateActions: expect.any(Function),
    generateMeta: expect.any(Function),
}

describe('ExtensionManager', () => {
    describe('getExtension', () => {
        test('should return registered extensions by name', () => {
            const polling = ExtensionManager.getExtension('polling')
            expect(polling).toMatchObject(minimalExtensionMatcher)
        })

        test('should return named extensions registered through configuration', () => {
            configure({ extensions: { useless: minimalExtensionObj } })
            const useless = ExtensionManager.getExtension('useless')
            expect(useless).toMatchObject(minimalExtensionMatcher)
        })

        test('should throw an error when called with an unregistered extension', () => {
            const ersatz = () => ExtensionManager.getExtension('ersatz')
            expect(ersatz).toThrow()
        })
    })
})
