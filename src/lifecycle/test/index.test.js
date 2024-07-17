import { Lifecycle } from '../';

describe('Lifecycle', () => {
  /**
   * @type{Lifecycle}
   */
  let lifecycle;

  const method = Symbol('method');
  const dataKey = Symbol('dataKey');
  const request = Symbol('request');
  const response = Symbol('response');
  const meta = Symbol('meta');
  const declaration = Symbol('declaration');
  const error = Symbol('error');
  const props = Symbol('props');

  beforeEach(() => {
    lifecycle = new Lifecycle();
  });

  it('should be able to call all the methods without error', () => {
    expect(() => {
      lifecycle.onRequest({ method, dataKey, request, meta, declaration });
    }).not.toThrow();
  });

  it('should call onRequest if set', () => {
    const lifecycleConfig = {
      onRequest: jest.fn(),
    };

    lifecycle.registerLifecycleConfig(lifecycleConfig);

    lifecycle.onRequest({ method, dataKey, request, meta, declaration });

    expect(lifecycleConfig.onRequest).toHaveBeenCalledWith({
      method,
      dataKey,
      request,
      meta,
      declaration,
    });
  });

  it('should call onSuccess if set', () => {
    const lifecycleConfig = {
      onSuccess: jest.fn(),
    };

    lifecycle.registerLifecycleConfig(lifecycleConfig);

    lifecycle.onSuccess({
      method,
      dataKey,
      request,
      response,
      meta,
      declaration,
    });

    expect(lifecycleConfig.onSuccess).toHaveBeenCalledWith({
      method,
      dataKey,
      request,
      response,
      meta,
      declaration,
    });
  });

  it('should call onFailure if set', () => {
    const lifecycleConfig = {
      onFailure: jest.fn(),
    };

    lifecycle.registerLifecycleConfig(lifecycleConfig);

    lifecycle.onFailure({ method, dataKey, error, meta, declaration });

    expect(lifecycleConfig.onFailure).toHaveBeenCalledWith({
      method,
      dataKey,
      error,
      meta,
      declaration,
    });
  });

  it('should call onDeclare if set', () => {
    const lifecycleConfig = {
      onDeclare: jest.fn(),
    };

    lifecycle.registerLifecycleConfig(lifecycleConfig);

    lifecycle.onDeclare({ declaration, props });

    expect(lifecycleConfig.onDeclare).toHaveBeenCalledWith({
      declaration,
      props,
    });
  });
});
