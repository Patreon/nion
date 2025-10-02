import ApiManager from '../api';
import {
  NION_API_REQUEST,
  NION_API_SUCCESS,
  NION_API_FAILURE,
  NION_API_BOOTSTRAP,
  NION_API_NO_OPERATION,
  UPDATE_ENTITY,
} from './types';
import { selectData } from '../selectors';

const isNetworkAction = (method) => {
  switch (method) {
    case 'GET':
    case 'POST':
    case 'PUT':
    case 'PATCH':
    case 'DELETE':
      return true;
    default:
      return false;
  }
};

export const getDataFromResponseText = ({ text }) => {
  // get data object from response text json string. return {} if text is falsey or is not valid json string format.
  const defaultObject = {};
  try {
    // if text is null/empty/falsey, return default empty object
    return text ? JSON.parse(text) : defaultObject;
  } catch (error) {
    // if text is invalid json syntax, return default empty object, and let nion log error from api response instead
    if (error instanceof SyntaxError) {
      return defaultObject;
    }
    throw error;
  }
};

const apiAction = (method, dataKey, options) => (_dispatch) => {
  const { body, declaration = {}, endpoint } = options;

  const meta = {
    ...options.meta,
    dataKey,
    endpoint,
    method,
    isProcessing: true,
  };

  const { apiType = ApiManager.getDefaultApi() } = declaration;
  const parse = ApiManager.getParser(apiType);
  const ErrorClass = ApiManager.getErrorClass(apiType);
  const apiOptions = ApiManager.getApiOptions();

  // Return our async / thunk API call manager
  return _dispatch(async (dispatch, getState) => {
    await dispatch({
      type: NION_API_REQUEST,
      meta,
    });

    try {
      if (isNetworkAction(method) && !apiOptions.isClient) {
        return await _dispatch({
          type: NION_API_NO_OPERATION,
          payload: {},
        });
      }

      const requestParams = await ApiManager.getRequestParameters(apiType, method, options);

      // Add the request body if present
      if (body) {
        requestParams.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint, {
        method,
        ...requestParams,
        ...declaration.requestParams,
      });

      // Handle the case that calling response.json() on null responses throws a syntax error
      const text = await response.text();
      const data = getDataFromResponseText({ text });

      // Handle any request errors since fetch doesn't throw
      if (!response.ok) {
        const { status, statusText } = response;
        throw new ErrorClass(status, statusText, {
          // The spread operator doesn't spread in built-in properties from Response objects, but we want
          // to be able to access the URL in the error class for logging purposes, so we pass it in explicitly
          url: response.url,
          ...response,
          ...data,
        });
      }

      await dispatch({
        type: NION_API_SUCCESS,
        meta: {
          ...meta,
          fetchedAt: Date.now(),
          statusCode: response.status,
          isProcessing: response.status === 202 ? true : false,
        },
        payload: {
          requestType: apiType,
          responseData: parse(data),
        },
      });

      return selectData(dataKey)(getState());
    } catch (error) {
      try {
        await dispatch({
          type: NION_API_FAILURE,
          meta: {
            ...meta,
            fetchedAt: Date.now(),
            statusCode: error.status,
            isProcessing: false,
          },
          payload: error,
        });
      } catch (renderError) {
        // We probably want to catch any render errors here, logging them but actually
        // throwing the api error that caused it
        // TODO (legacied no-console)
        // This failure is legacied in and should be updated. DO NOT COPY.
        // eslint-disable-next-line no-console
        console.error(renderError);
      }
      throw error;
    }
  });
};

const getAction = (dataKey, options) => {
  return apiAction('GET', dataKey, options);
};

const postAction = (dataKey, options) => {
  return apiAction('POST', dataKey, options);
};

const putAction = (dataKey, options) => {
  return apiAction('PUT', dataKey, options);
};

const patchAction = (dataKey, options) => {
  return apiAction('PATCH', dataKey, options);
};

const deleteAction = (dataKey, options) => {
  return apiAction('DELETE', dataKey, {
    ...options,
    meta: {
      ...options.meta,
      refToDelete: options.refToDelete,
    },
  });
};

/**
 * @deprecated
 */
const bootstrapAction = ({ apiType, dataKey, data }) => {
  const parse = ApiManager.getParser(apiType);
  return {
    type: NION_API_BOOTSTRAP,
    meta: { dataKey },
    payload: {
      apiType,
      responseData: parse(data),
    },
  };
};

/**
 * @deprecated Will be renamed
 */
const updateEntityAction = ({ type, id }, attributes) => {
  return {
    type: UPDATE_ENTITY,
    payload: { type, id, attributes },
  };
};

export const get = getAction;
export const post = postAction;
export const put = putAction;
export const patch = patchAction;
export { deleteAction as delete };
export const bootstrap = bootstrapAction;
export const updateEntity = updateEntityAction;

// TODO (legacied import/no-default-export)
// This failure is legacied in and should be updated. DO NOT COPY.
// eslint-disable-next-line import/no-default-export
export default {
  get,
  put,
  post,
  patch,
  delete: deleteAction,
  bootstrap,
  updateEntity,
};
