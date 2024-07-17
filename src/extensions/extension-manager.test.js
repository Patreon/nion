import ExtensionManager from './';
import configure from '../configure';

const minimalExtensionShape = {
  composeActions: jest.fn(),
  composeMeta: jest.fn(),
};
const minimalExtensionMatcher = {
  composeActions: expect.any(Function),
  composeMeta: expect.any(Function),
};

describe('ExtensionManager', () => {
  describe('registerExtension', () => {
    test('should throw a validation error for non-extension objects', () => {
      const badRegistration = () => ExtensionManager.registerExtension('stuff', {});
      expect(badRegistration).toThrow();
    });

    test('should throw a validation error for poorly-formed extension names', () => {
      const badNames = ['a', '1number', 'Stuff', 'some-punctuation'];

      const registration = (name) => ExtensionManager.registerExtension(name, minimalExtensionShape);

      badNames.forEach((name) => {
        const badRegistration = registration.bind(this, name);

        expect(badRegistration).toThrow();
      });
    });

    test('should add valid extension to internal extensionMap property', () => {
      expect(ExtensionManager.extensionMap).toEqual({});

      ExtensionManager.registerExtension('minimal', minimalExtensionShape);

      expect(ExtensionManager.extensionMap).toEqual({
        minimal: minimalExtensionShape,
      });
    });
  });

  describe('getExtension', () => {
    beforeAll(() => {
      ExtensionManager.registerExtension('minimal', minimalExtensionShape);
    });

    test('should return registered extensions by name', () => {
      const minimalExtension = ExtensionManager.getExtension('minimal');
      expect(minimalExtension).toMatchObject(minimalExtensionMatcher);
    });

    test('should return named extensions registered through configuration', () => {
      configure({ extensions: { useless: minimalExtensionShape } });
      const useless = ExtensionManager.getExtension('useless');
      expect(useless).toMatchObject(minimalExtensionMatcher);
    });

    test('should throw an error when called with an unregistered extension', () => {
      const ersatz = () => ExtensionManager.getExtension('ersatz');
      expect(ersatz).toThrow();
    });
  });
});
