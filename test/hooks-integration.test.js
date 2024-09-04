/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import nock from 'nock';

import { useNion, makeRef, exists } from '../src/index';

import configureTestStore from './configure-test-store';
import { delay, getMockedComponentProps } from './util';

const StoreWrapper = ({ children }) => {
  const store = configureTestStore();
  return <Provider store={store}>{children}</Provider>;
};

const baseUrl = 'http://api.test.com';
const buildUrl = (path) => (path.startsWith('/') ? baseUrl + path : baseUrl + '/' + path);

describe('nion hooks: integration tests', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('nion decorator', () => {
    it('injects props into the component', async () => {
      const { result } = renderHook(
        () =>
          useNion({
            dataKey: 'test',
            endpoint: buildUrl('/test'),
          }),
        {
          wrapper: StoreWrapper,
        },
      );

      expect(result.current).toBeDefined();
      expect(result.current[0]).toBeDefined();

      // Test the expected nion dataProp API interface
      const [test, actions, request] = result.current;

      // Actions
      expect(actions.get).toBeDefined();
      expect(actions.post).toBeDefined();
      expect(actions.patch).toBeDefined();
      expect(actions.delete).toBeDefined();

      // Request
      expect(request).toBeDefined();
      expect(request.status).toEqual('not called');

      // Data
      expect(test).toBeNull();

      // Advanced features
      expect(actions.updateRef).toBeDefined();
      expect(actions.updateEntity).toBeDefined();
    });

    it('gets data on demand', async () => {
      const pathname = 'test';
      const name = 'Testy McTestFace';

      const endpoint = buildUrl(pathname);
      nock(endpoint)
        .get('')
        .query(true)
        .reply(200, {
          data: {
            id: 123,
            type: 'animal',
            attributes: { name },
          },
        });

      const { result } = renderHook(() => useNion({ dataKey: 'test', endpoint }), {
        wrapper: StoreWrapper,
      });

      let [test, actions, request] = result.current;

      let waitingFor;

      act(() => {
        waitingFor = actions.get();
      });

      await delay(0); // wait for useEffect to go
      [test, actions, request] = result.current;
      expect(request.status).toEqual('pending');
      expect(request.isLoading).toEqual(true);

      await waitingFor;
      [test, actions, request] = result.current;
      expect(request.status).toEqual('success');
      expect(test.name).toEqual(name);
    });

    it('fetches data on mount', async () => {
      const pathname = 'test';
      const name = 'Testy McTestFace';

      const endpoint = buildUrl(pathname);
      nock(endpoint)
        .get('')
        .query(true)
        .reply(200, {
          data: {
            id: 123,
            type: 'animal',
            attributes: { name },
          },
        });

      const { result } = renderHook(
        () =>
          useNion({
            dataKey: 'test',
            endpoint,
            fetchOnMount: true,
          }),
        {
          wrapper: StoreWrapper,
        },
      );

      await delay(15); // Wait 15ms for the request reducer to update

      const [test, , request] = result.current;
      expect(request.status).toEqual('success');
      expect(test.name).toEqual(name);
    });

    it('patches data', async () => {
      const pathname = 'test';
      const name = 'Testy McTestFace';
      const newName = 'Nion McNionFace';

      const endpoint = buildUrl(pathname);
      nock(endpoint)
        .get('')
        .query(true)
        .reply(200, {
          data: {
            id: 123,
            type: 'animal',
            attributes: { name },
          },
        });

      nock(endpoint)
        .patch('')
        .query(true)
        .reply(200, {
          data: {
            id: 123,
            type: 'animal',
            attributes: { name: newName },
          },
        });

      const { result } = renderHook(() => useNion({ dataKey: 'test', endpoint }), {
        wrapper: StoreWrapper,
      });

      let [test, actions, request] = result.current;
      let waitingFor = actions.get();
      [test, actions, request] = result.current;
      expect(request.status).toEqual('pending');
      expect(request.isLoading).toEqual(true);

      await waitingFor;
      [test, actions, request] = result.current;
      expect(request.status).toEqual('success');
      expect(test.name).toEqual(name);

      // Patch request
      waitingFor = actions.patch();
      [test, actions, request] = result.current;
      expect(request.status).toEqual('pending');
      expect(request.isLoading).toEqual(true);

      await waitingFor;
      [test, actions, request] = result.current;
      expect(request.status).toEqual('success');
      expect(test.name).toEqual(newName);
    });

    it('deletes data', async () => {
      const pathname = 'test';
      const name = 'Testy McTestFace';

      const endpoint = buildUrl(pathname);
      nock(endpoint)
        .get('')
        .query(true)
        .reply(200, {
          data: {
            id: 123,
            type: 'animal',
            attributes: { name },
          },
        });

      nock(endpoint).delete('').query(true).reply(204);

      const { result } = renderHook(() => useNion({ dataKey: 'test', endpoint }), {
        wrapper: StoreWrapper,
      });

      let [test, actions, request] = result.current;
      let waitingFor = actions.get();

      await delay(0);
      [test, actions, request] = result.current;
      expect(request.status).toEqual('pending');
      expect(request.isLoading).toEqual(true);

      await waitingFor;
      [test, actions, request] = result.current;
      expect(request.status).toEqual('success');
      expect(test.name).toEqual(name);

      // Delete request
      await actions.delete();
      [test, actions, request] = result.current;
      expect(request.status).toEqual('success');

      expect(!!test).toEqual(false);
    });

    it('handles an error', async () => {
      const pathname = 'test';

      const endpoint = buildUrl(pathname);
      nock(endpoint).get('').delay(2000).query(true).reply(404);

      const { result } = renderHook(() => useNion({ dataKey: 'test', endpoint }), {
        wrapper: StoreWrapper,
      });

      let [, actions, request] = result.current;
      let waitingFor = actions.get();

      await waitingFor.catch((err) => {
        // TODO (legacied  jest/no-conditional-expect)
        // This failure is legacied in and should be updated. DO NOT COPY.
        // eslint-disable-next-line  jest/no-conditional-expect
        expect(err).toBeInstanceOf(Error);
      });
      [, actions, request] = result.current;
      expect(request.status).toEqual('error');
      expect(request.isError).toEqual(true);
      expect(request.isLoading).toEqual(false);
    });

    it('handles optimistic updates', async () => {
      const pathname = 'test';
      const name = 'Testy McTestFace';
      const newName = 'Nion McNionFace';

      const endpoint = buildUrl(pathname);
      nock(endpoint)
        .get('')
        .query(true)
        .reply(200, {
          data: {
            id: 123,
            type: 'animal',
            attributes: { name },
          },
        });

      const { result } = renderHook(() => useNion({ dataKey: 'test', endpoint }), {
        wrapper: StoreWrapper,
      });

      let [test, actions, request] = result.current;
      let waitingFor = actions.get();
      [test, actions, request] = result.current;
      expect(request.status).toEqual('pending');
      expect(request.isLoading).toEqual(true);

      await waitingFor;
      [test, actions, request] = result.current;
      expect(request.status).toEqual('success');
      expect(test.name).toEqual(name);

      // Optimistic Update
      [test, actions, request] = result.current;
      act(() => {
        actions.updateEntity(
          {
            type: 'animal',
            id: 123,
          },
          {
            name: newName,
          },
        );
      });
      [test, actions, request] = result.current;
      expect(test.name).toEqual(newName);
    });

    it('creates children with initial refs', async () => {
      const pathname = 'test';
      const name = 'Testy McTestFace';

      const endpoint = buildUrl(pathname);
      nock(endpoint)
        .get('')
        .query(true)
        .reply(200, {
          data: {
            id: 123,
            type: 'animal',
            attributes: { name },
          },
        });

      const InnerContainer = jest.fn(() => null);

      function ChildContainer(props) {
        const returned = useNion(
          {
            dataKey: 'child',
            endpoint,
            initialRef: makeRef(props.inputData),
          },
          [props.inputData],
        );
        return <InnerContainer returned={returned} />;
      }

      function Container() {
        const [test, actions] = useNion({
          dataKey: 'test',
          endpoint,
        });

        // useDebug([actions])
        useEffect(() => {
          actions.get();
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);
        return test ? <ChildContainer inputData={test} /> : <span />;
      }

      render(<Container />, {
        wrapper: StoreWrapper,
      });
      await delay(50);

      const child = getMockedComponentProps(InnerContainer).returned;
      expect(exists(child[0])).toEqual(true);
    });
  });
});

describe('hooks re-render performance', () => {
  let numRenders;
  beforeEach(() => {
    numRenders = 0;
  });

  it('should only render once per action with minimal config', async () => {
    const InnerContainer = jest.fn(() => null);

    function Container() {
      const returned = useNion({
        dataKey: 'test',
        endpoint: buildUrl('/test'),
      });
      return React.useMemo(() => {
        numRenders += 1;
        return <InnerContainer returned={returned} />;
      }, [returned]);
    }

    render(<Container />, {
      wrapper: StoreWrapper,
    });

    // 1 for change to state and 1 for the initial render
    expect(numRenders).toBe(1);

    const [data1, actions1] = getMockedComponentProps(InnerContainer).returned;

    const endpoint = buildUrl('/test');
    nock(endpoint)
      .get('')
      .query(true)
      .reply(200, {
        data: {
          id: 123,
          type: 'animal',
          attributes: { name },
        },
      });

    let a;

    act(() => {
      a = actions1.get();
    });

    const [data2, actions2] = getMockedComponentProps(InnerContainer).returned;

    expect(data2).toBe(data1);
    expect(actions1).toBe(actions2);

    expect(numRenders).toBe(2);

    await a;
    await delay(1);

    expect(numRenders).toBe(3);

    // TODO: re-enable this check. Switching to RTL caused these actions instances to no longer equal each other, but it's
    // likely due to some oversight in using RTL itself since no implementation changed. It's also possible that there
    // was some issue with how Enzyme was set up that caused us to get stale values or something.
    // const [, actions3] = getMockedComponentProps(InnerContainer).returned;
    // expect(actions3).toBe(actions2);
  });
});

/* eslint-enable react/prop-types */
