import { render } from '@testing-library/react';
import React, { Component } from 'react';
import { withProps } from 'recompose';
import nock from 'nock';
import PropTypes from 'prop-types';

import nion, { exists, makeRef } from '../src/index';

import { Provider } from 'react-redux';
import configureTestStore from './configure-test-store';
import { delay, getMockedComponentProps } from './util';

const StoreWrapper = ({ children }) => {
  const store = configureTestStore();
  return <Provider store={store}>{children}</Provider>;
};
StoreWrapper.propTypes = {
  children: PropTypes.node,
};

const InnerContainer = jest.fn(() => null);

function getNionProp(mockedComponent = InnerContainer) {
  return getMockedComponentProps(mockedComponent).nion;
}

const baseUrl = 'http://api.test.com';
const buildUrl = (path) => (path.startsWith('/') ? baseUrl + path : baseUrl + '/' + path);

describe('nion : integration tests', () => {
  afterEach(() => {
    nock.cleanAll();
    InnerContainer.mockClear();
  });

  describe('nion decorator', () => {
    it('injects props into the component', async () => {
      @nion({
        test: {
          endpoint: buildUrl('/test'),
        },
      })
      // We need to use a class component since this is a class component-specific test
      // eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
      class Container extends Component {
        render() {
          return <InnerContainer {...this.props} />;
        }
      }

      render(<Container />, {
        wrapper: StoreWrapper,
      });

      const nionProp = getNionProp();

      expect(nionProp).toBeDefined();
      expect(nionProp.test).toBeDefined();

      // Test the expected nion dataProp API interface
      const { test } = nionProp;

      // Actions
      expect(test.actions.get).toBeDefined();
      expect(test.actions.post).toBeDefined();
      expect(test.actions.patch).toBeDefined();
      expect(test.actions.delete).toBeDefined();

      // Request
      expect(test.request).toBeDefined();
      expect(test.request.status).toEqual('not called');

      // Data
      expect(test.id).toBeUndefined();
      expect(test.type).toBeUndefined();

      // Advanced features
      expect(test.actions.updateRef).toBeDefined();
      expect(nionProp.updateEntity).toBeDefined();
    });

    it('uses input props to populate declarations', async () => {
      @withProps({ id: 123 })
      @nion(({ id }) => ({
        test: {
          endpoint: buildUrl(`test/${id}`),
        },
      }))
      // TODO (legacied react-prefer-function-component/react-prefer-function-component)
      // This failure is legacied in and should be updated. DO NOT COPY.
      // eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
      class Container extends Component {
        render() {
          return <InnerContainer {...this.props} />;
        }
      }

      render(<Container />, {
        wrapper: StoreWrapper,
      });

      const nionProp = getNionProp();

      const declarations = nionProp.getDeclarations();
      expect(declarations.test.endpoint).toEqual(buildUrl('test/123'));
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

      @nion({ test: { endpoint } })
      // TODO (legacied react-prefer-function-component/react-prefer-function-component)
      // This failure is legacied in and should be updated. DO NOT COPY.
      // eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
      class Container extends Component {
        render() {
          return <InnerContainer {...this.props} />;
        }
      }

      render(<Container />, {
        wrapper: StoreWrapper,
      });

      let test = getNionProp().test;
      const request = test.actions.get();

      test = getNionProp().test;
      expect(test.request.status).toEqual('pending');
      expect(test.request.isLoading).toEqual(true);

      await request;

      test = getNionProp().test;
      expect(test.request.status).toEqual('success');
      expect(test.data.name).toEqual(name);
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

      @nion({
        test: {
          endpoint,
          fetchOnInit: true,
        },
      })
      // TODO (legacied react-prefer-function-component/react-prefer-function-component)
      // This failure is legacied in and should be updated. DO NOT COPY.
      // eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
      class Container extends Component {
        render() {
          return <InnerContainer {...this.props} />;
        }
      }

      render(<Container />, {
        wrapper: StoreWrapper,
      });

      await delay(15); // Wait 15ms for the request reducer to update

      const { test } = getNionProp();
      expect(test.request.status).toEqual('success');
      expect(test.data.name).toEqual(name);
    });

    it('fetches data from props', async () => {
      const pathname = 'test';
      const name = 'Testy McTestFace';
      const id = 123;

      const endpoint = buildUrl(`${pathname}/${id}`);
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

      @nion((props) => ({
        test: {
          // TODO (legacied react/prop-types)
          // This failure is legacied in and should be updated. DO NOT COPY.
          // eslint-disable-next-line react/prop-types
          endpoint: buildUrl(`${pathname}/${props.id}`),
          fetchOnInit: true,
        },
      }))
      // TODO (legacied react-prefer-function-component/react-prefer-function-component)
      // This failure is legacied in and should be updated. DO NOT COPY.
      // eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
      class Container extends Component {
        render() {
          return <InnerContainer {...this.props} />;
        }
      }

      render(<Container id={id} />, {
        wrapper: StoreWrapper,
      });

      // Wait until the request reducer has been updated
      while (getNionProp().test.request.status === 'not called') {
        await delay(1); // Wait 1ms for the request reducer to update
      }

      let test = getNionProp().test;
      expect(test.request.status).toEqual('pending');
      expect(test.request.isLoading).toEqual(true);

      await delay(15); // Wait 15ms for the request reducer to update

      test = getNionProp().test;
      expect(test.request.status).toEqual('success');
      expect(test.data.name).toEqual(name);
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

      @nion({ test: { endpoint: buildUrl(pathname) } })
      // TODO (legacied react-prefer-function-component/react-prefer-function-component)
      // This failure is legacied in and should be updated. DO NOT COPY.
      // eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
      class Container extends Component {
        render() {
          return <InnerContainer {...this.props} />;
        }
      }

      render(<Container />, {
        wrapper: StoreWrapper,
      });

      let test = getNionProp().test;
      let request = test.actions.get();

      test = getNionProp().test;
      expect(test.request.status).toEqual('pending');
      expect(test.request.isLoading).toEqual(true);

      await request;

      test = getNionProp().test;
      expect(test.request.status).toEqual('success');
      expect(test.data.name).toEqual(name);

      // Patch request
      request = test.actions.patch();

      test = getNionProp().test;
      expect(test.request.status).toEqual('pending');
      expect(test.request.isLoading).toEqual(true);

      await request;

      test = getNionProp().test;
      expect(test.request.status).toEqual('success');
      expect(test.data.name).toEqual(newName);
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

      @nion({ test: { endpoint: buildUrl(pathname) } })
      // TODO (legacied react-prefer-function-component/react-prefer-function-component)
      // This failure is legacied in and should be updated. DO NOT COPY.
      // eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
      class Container extends Component {
        render() {
          return <InnerContainer {...this.props} />;
        }
      }

      render(<Container />, {
        wrapper: StoreWrapper,
      });

      let test = getNionProp().test;
      let request = test.actions.get();

      test = getNionProp().test;
      expect(test.request.status).toEqual('pending');
      expect(test.request.isLoading).toEqual(true);

      await request;

      test = getNionProp().test;
      expect(test.request.status).toEqual('success');
      expect(test.data.name).toEqual(name);

      // Delete request
      request = test.actions.delete();

      await request;

      test = getNionProp().test;
      expect(test.request.status).toEqual('success');

      expect(exists(test)).toEqual(false);
    });

    it('handles an error', async () => {
      const pathname = 'test';

      const endpoint = buildUrl(pathname);
      nock(endpoint).get('').delay(2000).query(true).reply(404);

      @nion({ test: { endpoint } })
      // TODO (legacied react-prefer-function-component/react-prefer-function-component)
      // This failure is legacied in and should be updated. DO NOT COPY.
      // eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
      class Container extends Component {
        render() {
          return <InnerContainer {...this.props} />;
        }
      }

      render(<Container />, {
        wrapper: StoreWrapper,
      });

      let test = getNionProp().test;
      let request = test.actions.get();

      await request.catch((err) => {
        // TODO (legacied  jest/no-conditional-expect)
        // This failure is legacied in and should be updated. DO NOT COPY.
        // eslint-disable-next-line  jest/no-conditional-expect
        expect(err).toBeInstanceOf(Error);
      });

      test = getNionProp().test;
      expect(test.request.status).toEqual('error');
      expect(test.request.isError).toEqual(true);
      expect(test.request.isLoading).toEqual(false);
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

      @nion({ test: { endpoint: buildUrl(pathname) } })
      // TODO (legacied react-prefer-function-component/react-prefer-function-component)
      // This failure is legacied in and should be updated. DO NOT COPY.
      // eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
      class Container extends Component {
        render() {
          return <InnerContainer {...this.props} />;
        }
      }

      render(<Container />, {
        wrapper: StoreWrapper,
      });

      let test = getNionProp().test;
      let request = test.actions.get();

      test = getNionProp().test;
      expect(test.request.status).toEqual('pending');
      expect(test.request.isLoading).toEqual(true);

      await request;

      test = getNionProp().test;
      expect(test.request.status).toEqual('success');
      expect(test.data.name).toEqual(name);

      // Optimistic Update

      test = getNionProp().test;
      getNionProp().updateEntity(
        {
          type: 'animal',
          id: 123,
        },
        {
          name: newName,
        },
      );

      test = getNionProp().test;
      expect(test.data.name).toEqual(newName);
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

      @nion((props) => ({
        child: {
          endpoint: buildUrl(pathname),
          // TODO (legacied react/prop-types)
          // This failure is legacied in and should be updated. DO NOT COPY.
          // eslint-disable-next-line react/prop-types
          initialRef: makeRef(props.inputData),
        },
      }))
      // TODO (legacied react-prefer-function-component/react-prefer-function-component)
      // This failure is legacied in and should be updated. DO NOT COPY.
      // eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
      class ChildContainer extends Component {
        render() {
          return (
            <div data-testid="child-container">
              <InnerContainer {...this.props} />
            </div>
          );
        }
      }

      function InternalContainerContents({ nion: { test } }) {
        return exists(test) ? <ChildContainer inputData={test.data} /> : <span />;
      }
      InternalContainerContents.propTypes = {
        nion: PropTypes.object,
      };
      const ContainerContents = jest.fn(InternalContainerContents);

      @nion({ test: { endpoint: buildUrl(pathname) } })
      // TODO (legacied react-prefer-function-component/react-prefer-function-component)
      // This failure is legacied in and should be updated. DO NOT COPY.
      // eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
      class Container extends Component {
        render() {
          return <ContainerContents {...this.props} />;
        }
      }

      render(<Container />, {
        wrapper: StoreWrapper,
      });

      let test = getNionProp(ContainerContents).test;
      let request = test.actions.get();

      test = getNionProp(ContainerContents).test;
      expect(test.request.status).toEqual('pending');
      expect(test.request.isLoading).toEqual(true);

      await request;

      test = getNionProp(ContainerContents).test;
      expect(test.request.status).toEqual('success');
      expect(test.data.name).toEqual(name);

      // Child component
      let child = getNionProp().child;
      expect(exists(child)).toEqual(true);
    });
  });
});
