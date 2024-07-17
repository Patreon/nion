import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import union from 'lodash/union';
import ApiManager from '../api';

import * as actionTypes from './types';
import apiActions, { getDataFromResponseText } from './index';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

class ApiEndpoint {
  get url() {
    return this.baseUrl + this.route;
  }
  constructor(baseUrl = 'http://api.test.com', route = '/items') {
    this.baseUrl = baseUrl;
    this.route = route;
  }
}

describe('nion: actions', () => {
  describe('API actions', () => {
    afterEach(() => {
      nock.cleanAll();
    });

    it('GET api action should create the correct actions', async () => {
      const apiEndpoint = new ApiEndpoint();
      const jsonPayload = { body: {} };
      const statusCode = 200;

      nock(apiEndpoint.baseUrl).get(apiEndpoint.route).reply(statusCode, jsonPayload);

      const dataKey = 'items';
      const expectedActions = [
        {
          type: actionTypes.NION_API_REQUEST,
          meta: {
            dataKey,
            endpoint: apiEndpoint.url,
            method: 'GET',
            isProcessing: true,
          },
        },
        {
          type: actionTypes.NION_API_SUCCESS,
          meta: {
            dataKey,
            fetchedAt: Date.now(),
            endpoint: apiEndpoint.url,
            method: 'GET',
            statusCode,
            isProcessing: false,
          },
          payload: {
            requestType: ApiManager.getDefaultApi(),
            responseData: ApiManager.getParser()(jsonPayload),
          },
        },
      ];

      const store = mockStore({});

      await store.dispatch(
        apiActions.get(dataKey, {
          endpoint: apiEndpoint.url,
        }),
      );

      const observedActions = store.getActions();
      expectedActions.forEach((expectedAction, index) => {
        assertEqualAction(expectedAction, observedActions[index]);
      });
    });

    it('GET api action should inform the request is still processing', async () => {
      const apiEndpoint = new ApiEndpoint();
      const jsonPayload = { body: {} };
      const statusCode = 202;

      nock(apiEndpoint.baseUrl).get(apiEndpoint.route).reply(statusCode, jsonPayload);

      const dataKey = 'items';
      const expectedActions = [
        {
          type: actionTypes.NION_API_REQUEST,
          meta: {
            dataKey,
            endpoint: apiEndpoint.url,
            method: 'GET',
            isProcessing: true,
          },
        },
        {
          type: actionTypes.NION_API_SUCCESS,
          meta: {
            dataKey,
            fetchedAt: Date.now(),
            endpoint: apiEndpoint.url,
            method: 'GET',
            statusCode,
            isProcessing: true,
          },
          payload: {
            requestType: ApiManager.getDefaultApi(),
            responseData: ApiManager.getParser()(jsonPayload),
          },
        },
      ];

      const store = mockStore({});

      await store.dispatch(
        apiActions.get(dataKey, {
          endpoint: apiEndpoint.url,
        }),
      );

      const observedActions = store.getActions();
      expectedActions.forEach((expectedAction, index) => {
        assertEqualAction(expectedAction, observedActions[index]);
      });
    });

    it('GET api action should handle errors with the correct actions', async () => {
      const apiEndpoint = new ApiEndpoint();
      const jsonPayload = { body: {} };
      const statusCode = 500;

      nock(apiEndpoint.baseUrl).get(apiEndpoint.route).reply(statusCode, jsonPayload);

      const dataKey = 'items';
      const expectedActions = [
        {
          type: actionTypes.NION_API_REQUEST,
          meta: {
            dataKey,
            endpoint: apiEndpoint.url,
            method: 'GET',
            isProcessing: true,
          },
        },
        {
          type: actionTypes.NION_API_FAILURE,
          meta: {
            dataKey,
            fetchedAt: Date.now(),
            endpoint: apiEndpoint.url,
            method: 'GET',
            statusCode,
            isProcessing: false,
          },
        },
      ];

      const store = mockStore({});

      try {
        await store.dispatch(
          apiActions.get(dataKey, {
            endpoint: apiEndpoint.url,
          }),
        );
      } catch (err) {
        // TODO: Get this working with the ApiManager.getErrorClass class constructor
        expect(err).toBeInstanceOf(Error);
        // Replace the error in the expectedAction payload with the Error caught here
        // to simulate the logic of the payload construction
        expectedActions[1].payload = err;
      }

      const observedActions = store.getActions();
      expectedActions.forEach((expectedAction, index) => {
        assertEqualAction(expectedAction, observedActions[index]);
      });
    });
  });

  describe('getDataFromResponseText', () => {
    it('return valid object for non-empty json text', async () => {
      const text = '{ "noam":"chomsky", "manufacturing":"consent"}';
      const expected = {
        noam: 'chomsky',
        manufacturing: 'consent',
      };

      const result = getDataFromResponseText({ text });

      expect(result).toEqual(expected);
    });

    it('return empty object for null text', async () => {
      const text = null;
      const expected = {};

      const result = getDataFromResponseText({ text });

      expect(result).toEqual(expected);
    });

    it('return empty object for undefined text', async () => {
      const text = undefined;
      const expected = {};

      const result = getDataFromResponseText({ text });

      expect(result).toEqual(expected);
    });

    it('return empty object for empty text', async () => {
      const text = '';
      const expected = {};

      const result = getDataFromResponseText({ text });

      expect(result).toEqual(expected);
    });

    it('return empty object for html text', async () => {
      const text = '<html>noam-chomsky</html>';
      const expected = {};

      const result = getDataFromResponseText({ text });

      expect(result).toEqual(expected);
    });

    it('return empty object for regular text', async () => {
      const text = 'manufacturing consent';
      const expected = {};

      const result = getDataFromResponseText({ text });

      expect(result).toEqual(expected);
    });
  });
});

function assertEqualAction(expected, observed) {
  expect(expected.type).toEqual(observed.type);

  const metaKeys = union(Object.keys(expected.meta || {}), Object.keys(observed.meta || {}));
  metaKeys.forEach((metaKey) => {
    if (metaKey === 'fetchedAt') {
      // Check to see that our fetchedAt value is within 30ms of our actual value
      const diff = expected.meta.fetchedAt - observed.meta.fetchedAt;
      expect(Math.abs(diff)).toBeLessThan(500);
    } else {
      expect(expected.meta[metaKey]).toEqual(observed.meta[metaKey]);
    }
  });

  const payloadKeys = union(Object.keys(expected.payload || {}), Object.keys(observed.payload || {}));
  payloadKeys.forEach((payloadKey) => {
    expect(expected.payload[payloadKey]).toEqual(observed.payload[payloadKey]);
  });
}
