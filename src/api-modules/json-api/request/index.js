// Simple pre/post request hooks (must return a promise) and a request parameter helper
// TODO (legacied no-unused-vars)
// This failure is legacied in and should be updated. DO NOT COPY.
// eslint-disable-next-line no-unused-vars
export const beforeRequest = (method, options) => {
  return Promise.resolve();
};

// TODO (legacied no-unused-vars)
// This failure is legacied in and should be updated. DO NOT COPY.
// eslint-disable-next-line no-unused-vars
export const afterRequest = (method, options) => {
  return Promise.resolve();
};

export const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json, application/xml, text/plain, text/html, *.*',
};

export const getRequestParameters = (_method, { declaration = {} } = {}) => {
  return {
    headers: declaration.headers || defaultHeaders,
  };
};
