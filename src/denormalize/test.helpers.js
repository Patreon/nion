import Immutable from 'seamless-immutable';

let _id = 1;
const generateId = () => {
  return String(_id++);
};

export class EntityStoreManager {
  store = Immutable({});

  addEntity = ({ type, id, ...rest }) => {
    this.store = this.store.merge(
      {
        [type]: {
          [id]: {
            type,
            id,
            ...rest,
          },
        },
      },
      { deep: true },
    );
    return this.store[type][id];
  };

  updateEntity = (...args) => {
    this.addEntity(...args);
  };

  removeEntity = ({ type, id }) => {
    this.store = this.store.merge(
      {
        [type]: {
          [id]: undefined,
        },
      },
      { deep: true },
    );
  };
}

export const makeUserEntity = () => {
  const id = generateId();
  return {
    type: 'user',
    id,
    attributes: {
      name: `Test User ${id}`,
    },
  };
};

export const makeFriendEntity = (friendId) => {
  const id = generateId();
  return {
    type: 'user',
    id,
    attributes: {
      name: `Friend User ${id}`,
    },
    relationships: {
      friend: {
        data: {
          type: 'user',
          id: friendId,
        },
      },
    },
  };
};

export const makeFriendsEntity = (friendIds) => {
  const id = generateId();
  return {
    type: 'user',
    id,
    attributes: {
      name: `Friend User ${id}`,
    },
    relationships: {
      friends: {
        data: friendIds.map((friendId) => ({
          type: 'user',
          id: friendId,
        })),
      },
    },
  };
};
