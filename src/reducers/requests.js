import Immutable from 'seamless-immutable';

import { NION_API_REQUEST, NION_API_SUCCESS, NION_API_FAILURE } from '../actions/types';

const initialState = Immutable({});

const requestsReducer = (state = initialState, action) => {
  switch (action.type) {
    case NION_API_REQUEST:
      return state.merge(
        {
          [action.meta.dataKey]: {
            isLoading: true,
            isProcessing: action.meta.isProcessing,
            pending: action.meta.method,
            status: 'pending',
            statusCode: undefined,
          },
        },
        { deep: true },
      );
    case NION_API_SUCCESS:
      return state.merge(
        {
          [action.meta.dataKey]: {
            fetchedAt: action.meta.fetchedAt,
            isError: false,
            isLoaded: true,
            isLoading: false,
            isProcessing: action.meta.isProcessing,
            status: 'success',
            statusCode: action.meta.statusCode,
          },
        },
        { deep: true },
      );
    case NION_API_FAILURE:
      return state.merge(
        {
          [action.meta.dataKey]: {
            errors: action.payload.errors,
            fetchedAt: action.meta.fetchedAt,
            isError: true,
            isLoaded: false,
            isLoading: false,
            isProcessing: action.meta.isProcessing,
            name: action.payload.name,
            pending: undefined,
            status: 'error',
            statusCode: action.meta.statusCode,
          },
        },
        { deep: true },
      );
    default:
      return state;
  }
};

export default requestsReducer;
