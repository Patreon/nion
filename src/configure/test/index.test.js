import configureNion from '../';
import ApiManager from '../../api';
import ExtensionManager from '../../extensions';
import Lifecycle from '../../lifecycle';
import reducers from '../../reducers';

const fakeApiModule = {
  ErrorClass: class {},
  parser: (response) => response,
  request: {
    getRequestParameters: () => {},
    beforeRequest: () => Promise.resolve(),
    afterRequest: () => Promise.resolve(),
  },
};

const fakeExtension = {
  composeActions: jest.fn(),
  composeMeta: jest.fn(),
};

const fakeRequestMethod = jest.fn();

describe('configuration', () => {
  let result;
  beforeEach(() => {
    result = configureNion({
      apiModules: { fakeApiModule },
      defaultApi: 'fakeApiModule',
      extensions: { fakeExtension },
      lifecycleConfig: {
        onRequest: fakeRequestMethod,
      },
    });
  });

  it('adds provided api modules to ApiManager', () => {
    expect(ApiManager.apiMap).toHaveProperty('fakeApiModule', fakeApiModule);
  });

  it('sets default api with ApiManager', () => {
    expect(ApiManager.defaultApiType).toEqual('fakeApiModule');
  });

  it('adds provided extensions to ExtensionManager', () => {
    expect(ExtensionManager.extensionMap).toHaveProperty('fakeExtension', fakeExtension);
  });

  it('adds provided lifecycle methods to Lifecycle', () => {
    expect(Lifecycle).toHaveProperty('_onRequest', fakeRequestMethod);
  });

  it('returns reducers', () => {
    expect(result).toEqual({ reducer: reducers });
  });
});
