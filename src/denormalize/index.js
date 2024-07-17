import Immutable from 'seamless-immutable';
import { camelize, camelizeKeys } from 'humps';
import cache, { mergeManifests } from './cache';

class GenericData {
  constructor(data) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    }
  }
}

GenericData.prototype._exists = true;

class Data {
  constructor(type, id, attributes) {
    this.type = type;
    this.id = id;

    for (const key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        this[key] = attributes[key];
      }
    }
  }
}

Data.prototype._exists = true;

const makeGenericData = (obj) => Immutable(new GenericData(obj), { prototype: GenericData.prototype });

export function getGenericRefData(ref) {
  if (ref === null || ref === undefined) {
    return null;
  }

  return ref instanceof Array ? ref.map(makeGenericData) : makeGenericData(ref);
}

export const addEntityReference = (obj, value) => obj && obj.set('_ref', value);

export const getEntityReference = (obj) => obj?._ref;

export const hasEntityReference = (obj) => Boolean(getEntityReference(obj));

// In order to optimize nion render performance, we want to both a) create immutable denormalized
// objects (for simple equality comparison in our shouldUpdate / shouldRender logic) and b) cache
// those denormalized objects to help reduce calls to the (somewhat) expensive denormalization step.
// We achieve this by using a denormalization cache to do the following:
//
// - Each ref ({ type, id }) tuple will have a corresponding manifest of related refs ({ id, type })
//   stored in the cache. This manifest includes a ref to every entity that composes the fully
//   denormalized object, and we construct this list as we recursively denormalize an entity
// - For each entity we denormalize, we keep a reference to the immutable entity object from the
//   store. This will make it easy to compare the cached entity with the current entity in the
//   passed in redux entityStore.
// - This lets us easily check whether any of the entities that are related to a given entity
//   (those that comprise the denormalized object) have changed by simple equality check of the
//   cached vs incoming redux store entities.
// - If the related entities have changed, we re-denormalize the object and store it, its entities,
//   and its related refs in the cache
// - If not, we simply fetch the already denormalized object from the cache
//
// Since all denormalized objects in the cache are immutable, we can very easily compare them
// in downstream selectors, redux connect functions, or componentShouldUpdate methods to optimize
// re-render performance
function denormalize(ref, entityStore, existingObjects = {}) {
  if (!(ref?.type && ref?.id)) {
    return { denormalized: undefined };
  }

  const { type, id } = ref;

  let manifest = cache.initializeManifest(ref);

  // Check to see if the underlying data has changed for the ref, if not - we'll return the
  // cached immutable denormalized version, otherwise we'll construct a new denormalized portion
  // and update the related refs that are part of this ref's dependency tree
  if (!cache.hasDataChanged(ref, entityStore)) {
    return {
      denormalized: cache.getDenormalized(type, id),
      related: manifest,
    };
  }

  // Check the existing object to see if a reference to the denormalized object already exists,
  // if so, use the existing denormalized object
  const existingObject = existingObjects?.[type]?.[id];

  if (existingObject) {
    return {
      denormalized: existingObject,
      related: manifest,
    };
  }

  // Otherwise, fetch the entity from the entity store
  const entity = entityStore?.[type]?.[id];

  if (entity === undefined) {
    return { denormalized: undefined };
  }

  // Construct the new base denormalized object and add it to the existing denormalized cache
  let obj = Immutable(new Data(type, id, camelizeKeys(entity.attributes)), {
    prototype: Data.prototype,
  });

  // Keep a secondary cache of the object as "in the process of being denormalized" before denormalizing relationships.
  // This prevents infinite recursion in the case of cycles in the relationship graph
  // (We don't add something to the primary cache until it's done being denormalized,
  // but in the case of a cycle we'll reach the same entity again before it's in the cache).
  existingObjects[type] = existingObjects[type] || {};
  existingObjects[type][id] = obj;

  // Now map over the relationships, accruing a list of related refs that we check for changes
  // against
  function mapRelationships(relationship, key) {
    const refOrRefs = relationship.data; // The { id, type } pointers stored on 'data' key
    const camelizedKey = camelize(key);

    // Define the next denormalized object or array of denormalized objects that we will set
    // on the specific key. We'll also need to add a _ref property to this object so we can
    // track the original information about the data
    let toSet;

    if (refOrRefs === null) {
      obj = obj.set(camelizedKey, null);

      return;
    }

    // (See the above note about the purpose of existingObjects for preventing infinite recursion in the case of relationship cycles)
    // We need to create a copy here, though, as cycles on one branch of the relationship graph
    // should not pollute the cycle detection for other branches.
    const existingObjectsCopy = Object.assign({}, existingObjects);

    if (!Array.isArray(refOrRefs)) {
      const { denormalized, related } = denormalize(refOrRefs, entityStore, existingObjectsCopy);

      toSet = denormalized;

      mergeManifests(manifest, related);
    } else {
      function mapCollection(_ref) {
        const { denormalized, related } = denormalize(_ref, entityStore, existingObjectsCopy);

        mergeManifests(manifest, related);

        return denormalized;
      }

      toSet = refOrRefs.map(mapCollection);
    }

    // Establish a "_ref" property on the object, that acts as a pointer to the original
    // relationship
    if (!hasEntityReference(toSet)) {
      toSet = addEntityReference(toSet, relationship);
    }

    obj = obj.set(camelizedKey, toSet);
  }

  if (entity.relationships) {
    for (const key in entity.relationships) {
      if (entity.relationships.hasOwnProperty(key)) {
        mapRelationships(entity.relationships[key], key);
      }
    }
  }

  // Establish a "_ref" property on the object, that acts as a pointer to the original entity
  if (!hasEntityReference(obj)) {
    obj = addEntityReference(obj, { data: { id, type } });
  }

  cache.addEntity(entity);
  cache.addManifest(entity, manifest);
  cache.addDenormalized(type, id, obj);

  return { denormalized: obj, related: manifest };
}

export const denormalizeEntities = (ref, entityStore) =>
  ref.entities.map((entity) => denormalize(entity, entityStore).denormalized);

export default denormalizeEntities;
