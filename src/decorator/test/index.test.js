import nion from '../';
import React from 'react';
import PropTypes from 'prop-types';
import { render } from '@testing-library/react'

import { Provider } from 'react-redux';
import configureTestStore from '../../../test/configure-test-store';

describe('nion', () => {
  describe('propTypes validation', () => {
    let OuterComponent;
    let originalConsoleError;
    let store;

    beforeAll(() => {
      originalConsoleError = global.console.error;
      // Treat all console.errors as test failures to catch failed propType validation
      global.console.error = (...args) => {
        throw new Error(args[0]);
      };
    });

    afterAll(() => {
      global.console.error = originalConsoleError;
    });

    beforeEach(() => {
      // TODO (legacied react-prefer-function-component/react-prefer-function-component)
      // This failure is legacied in and should be updated. DO NOT COPY.
      // eslint-disable-next-line react-prefer-function-component/react-prefer-function-component
      class WrappedComponent extends React.Component {
        static propTypes = {
          // TODO (legacied react/no-unused-prop-types)
          // This failure is legacied in and should be updated. DO NOT COPY.
          // eslint-disable-next-line react/no-unused-prop-types
          nion: PropTypes.object.isRequired,
        };

        render() {
          return null;
        }
      }
      OuterComponent = nion()(WrappedComponent);
      store = configureTestStore();
    });

    it('has no propTypes errors', () => {
      render(
        <Provider store={store}>
          <OuterComponent />
        </Provider>,
      );
    });
  });
});
