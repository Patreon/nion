import { camelizeKeys } from 'humps';

// The default api module doesn't normalize the data, it simply attaches it to the ref
export const parseApiResponse = (response) => {
  return {
    entryRef: camelizeKeys(response),
  };
};

// TODO (legacied import/no-default-export)
// This failure is legacied in and should be updated. DO NOT COPY.
// eslint-disable-next-line import/no-default-export
export default parseApiResponse;
