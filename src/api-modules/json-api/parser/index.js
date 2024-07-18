import map from 'lodash/map';
import every from 'lodash/every';

const addEntityToStoreFragment = (store, entity = {}) => {
  // It's important to have default attributes and relationships here, since we can accidentally
  // overwrite these keys when we merge the fragment into the redux store if they are undefined
  const { type, id, attributes = {}, relationships = {} } = entity;
  if (!entity) {
    return;
  }
  if (!(type in store)) {
    store[type] = {};
  }

  store[type][id] = {
    type,
    id,
    attributes,
    relationships,
  };
};

const normalizeDataEntities = (storeFragment, dataEntities) => {
  const entityList = Array.isArray(dataEntities) ? dataEntities : [dataEntities];
  entityList.map((entity) => addEntityToStoreFragment(storeFragment, entity));
};

const normalizeIncludedEntities = (storeFragment, includedEntities) => {
  map(includedEntities, (entity) => addEntityToStoreFragment(storeFragment, entity));
};

const makeEntitiesList = (data) => {
  if (!data) {
    return [];
  }
  const dataList = Array.isArray(data) ? data : [data];
  return dataList.map((entity) => ({ id: entity.id, type: entity.type }));
};

export const isJsonApiResponse = ({ data }) => {
  const dataList = Array.isArray(data) ? data : [data];
  return data && every(dataList, (ref) => ref.id !== undefined && ref.type !== undefined);
};

export const parseJsonApiResponse = (response = {}) => {
  const { data, included, meta, links } = response;

  // Create the new ref to pass to the entities reducer.
  const entryRef = {
    entities: makeEntitiesList(data),
    meta,
    links,
    isCollection: data instanceof Array,
  };

  // Create a store fragment map of normalized entities to pass to the entity reducer
  // This will take the shape of { [type] : { [id]: ... } }
  let storeFragment = {};
  normalizeDataEntities(storeFragment, data);
  normalizeIncludedEntities(storeFragment, included);

  return {
    storeFragment,
    entryRef,
  };
};

// TODO (legacied import/no-default-export)
// This failure is legacied in and should be updated. DO NOT COPY.
// eslint-disable-next-line import/no-default-export
export default parseJsonApiResponse;
