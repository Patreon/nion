import map from 'lodash/map';
import { camelizeKeys } from 'humps';

// A default error class for handling nion api errors
// TODO (legacied import/no-default-export)
// This failure is legacied in and should be updated. DO NOT COPY.
// eslint-disable-next-line import/no-default-export
export default class NionApiError extends Error {
  constructor(status, statusText, response) {
    super();
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.response = response;
    this.message = `${status} - ${statusText}`;
    this.errors = map(response.errors, (e) => camelizeKeys(e));
  }
}
