import configureNion from '../';
import ApiManager from '../../api';
import ExtensionManager from '../../extensions';
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

describe('configuration', () => {
  let result;
  beforeEach(() => {
    result = configureNion({
      apiModules: { fakeApiModule },
      defaultApi: 'fakeApiModule',
      extensions: { fakeExtension },
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

  it('returns reducers', () => {
    expect(result).toEqual({ reducer: reducers });
  });
});
