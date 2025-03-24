import Immutable from 'seamless-immutable';

import { createSelector } from 'reselect';

import get from 'lodash/get';
import omit from 'lodash/omit';

import { denormalizeEntities, getGenericRefData } from '../denormalize';

const selectNion = (state) => state && state.nion;

const selectEntities = createSelector([selectNion], (nion) => nion && nion.entities);

const selectReferences = createSelector([selectNion], (nion) => nion && nion.references);

const selectRequests = createSelector([selectNion], (nion) => nion && nion.requests);

const denormalizeRef = (ref, entityStore) => {
  // If the ref is a generic (eg a primitive from a non-json-api response), return the ref

  // JB (in ref to the comment above)
  // We know the API type, we should be storing this information with the payload
  // this will simplify our assumptions
  if (!ref || ref.entities === undefined) {
    return getGenericRefData(ref);
  }

  const denormalized = denormalizeEntities(ref, entityStore);

  return ref.isCollection ? denormalized : denormalized[0];
};

// We need to make a simple singleton default immutable request so that areRequestsEqual comparisons
// are super simple and straightforward in the areMergedPropsEqual comparison function
// TODO: We might want to refactor this so that each request dataKey in the requests reducer is
// initialized with this immutable state
const defaultRequest = Immutable({
  status: 'not called',
});

const selectRef = (key) => {
  return createSelector(selectReferences, (references) => get(references, key));
};

export const selectRequest = (key) => {
 return createSelector(selectRequests, (requests) => get(requests, key, defaultRequest));
};

const selectObj = (key) => {
  return createSelector([selectRef(key), selectEntities], (ref, entityStore) =>
    denormalizeRef(ref, entityStore),
  );
};

// Selects the denormalized object plus all relevant request data from the store
export const selectObjectWithRequest = (key) => {
  return createSelector(
    [selectObj(key), selectRef(key), selectRequest(key)],
    (obj, ref, request) => ({
      extra: omit(ref, ['entities', 'isCollection']),
      obj,
      request,
    }),
  );
};

// Selects a keyed map of { obj, request } resources from the store taking an array of dataKeys
export const selectResourcesForKeys = (keys) => (state) =>
  keys.reduce((memo, key) => {
    memo[key] = selectObjectWithRequest(key)(state);
    return memo;
  }, {});

// Use the _.get syntax to pass in an address string (ie <dataKey>.<attributeName>), and default
// value. If the provided argument is an object with the signature { type, id }, then select and
// denormalize the corresponding entity
export const selectData = (key, defaultValue) => {
  // If we pass in an object of { type, id } signature, denormalize the corresponding entity
  if (typeof key !== 'string' && !Array.isArray(key)) {

    return createSelector(
      [selectEntities],
      (entityStore) =>
        denormalizeRef(
          {
            entities: [{ type: key.type, id: key.id }],
          },
          entityStore,
        ) || defaultValue,
    );
  }

  const path = Array.isArray(key) ? key : key.replace(']', '').split(/[.|[]/g);

  return createSelector([selectObj(path[0])], (obj) => {
    if (obj === undefined) {
      return defaultValue;
    }

    return path.length === 1 ? obj : get(obj, path.slice(1, path.length), defaultValue);
  });
};
