import { makeRef } from './index';

describe('nion/transforms : makeRef', () => {
  const id = '123';
  const type = 'user';

  describe('when given an object with an attached _ref', () => {
    it('makes a ref from a singular { id, type } tuple', () => {
      const data = {
        _ref: {
          data: { id, type },
        },
      };
      const result = makeRef(data);
      const { entities, isCollection, links, meta } = result;
      expect(entities).toHaveLength(1);
      expect(entities[0]).toMatchObject({ id, type });
      expect(isCollection).toEqual(false);
      expect(links).toBeUndefined();
      expect(meta).toBeUndefined();
    });

    it('makes a ref from an array of { id, type } tuples', () => {
      const data = {
        _ref: {
          data: [
            { id, type },
            { id, type },
          ],
        },
      };
      const { entities, isCollection } = makeRef(data);
      expect(entities).toHaveLength(2);
      expect(entities[0]).toMatchObject({ id, type });
      expect(entities[1]).toMatchObject({ id, type });
      expect(isCollection).toEqual(true);
    });

    it('uses the passed in isCollection property', () => {
      const data = {
        _ref: {
          data: { id, type },
          isCollection: true,
        },
      };
      const { entities, isCollection } = makeRef(data);
      expect(entities).toHaveLength(1);
      expect(isCollection).toEqual(true);
    });

    it('uses the passed in meta property', () => {
      const data = {
        _ref: {
          data: { id, type },
          meta: { count: 1 },
        },
      };
      const { meta } = makeRef(data);
      expect(meta).toMatchObject({ count: 1 });
    });

    it('uses the passed in links property', () => {
      const data = {
        _ref: {
          data: { id, type },
          links: { next: 'next' },
        },
      };
      const { links } = makeRef(data);
      expect(links).toMatchObject({ next: 'next' });
    });
  });

  describe('when given data without an underlying _ref', () => {
    it('makes a ref from an object with id and type', () => {
      const data = {
        id,
        type,
      };
      const result = makeRef(data);
      const { entities, isCollection, links, meta } = result;
      expect(entities).toHaveLength(1);
      expect(entities[0]).toMatchObject({ id, type });
      expect(isCollection).toEqual(false);
      expect(links).toBeUndefined();
      expect(meta).toBeUndefined();
    });

    it('makes a ref from an array of objects with id and type', () => {
      const data = [
        {
          id,
          type,
        },
      ];
      const result = makeRef(data);
      const { entities, isCollection } = result;
      expect(entities).toHaveLength(1);
      expect(entities[0]).toMatchObject({ id, type });
      expect(isCollection).toEqual(true);
    });

    it('allows isCollection to be set manually through an option', () => {
      // This property is useful for setting an initial ref that is singular at the time of
      // instantiation, but will eventually be plural, ie a firstReply
      const data = {
        id,
        type,
      };
      const result = makeRef(data, { isCollection: true });
      const { entities, isCollection } = result;
      expect(entities).toHaveLength(1);
      expect(entities[0]).toMatchObject({ id, type });
      expect(isCollection).toEqual(true);
    });

    it('makes an empty ref when given invalid / nonexistent data', () => {
      const data = {};
      const result = makeRef(data);
      const { entities } = result;
      expect(entities).toHaveLength(0);
    });
  });
});
