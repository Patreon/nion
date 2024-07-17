import Immutable from 'seamless-immutable';
import {
  areMergedPropsEqual,
  passedPropsAreEqual,
  requestsAreEqual,
  extrasAreEqual,
  extensionsAreEqual,
  dataAreEqual,
} from '../should-rerender.js';

const makeDataObject = (data = {}) => {
  return Immutable({ type: 'test', id: '123', ...data });
};

const makeExtension = (actions = {}, meta = {}) => {
  return {
    get: () => {},
    ...actions,
    meta: {
      ...meta,
    },
  };
};

const nionize = (obj) => ({ nion: obj });

describe('nion: should-rerender', () => {
  describe('when there are extra or different top-level keys on nion', () => {
    describe('that are significant', () => {
      let data, prevProps, nextProps;

      beforeEach(() => {
        data = makeDataObject();
        prevProps = { user: { data } };
        nextProps = {};
      });
      it('should return false', () => {
        expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toEqual(false);
      });
      it('should fail a passedPropsAreEqual check', () => {
        expect(passedPropsAreEqual(prevProps, nextProps)).toEqual(false);
      });
    });

    describe('that are ignored', () => {
      it('should return true', () => {
        const data = makeDataObject();
        const keysToIgnore = ['_initializeDataKey', 'updateEntity', '_declarations'];
        keysToIgnore.forEach((key) => {
          const prevProps = {
            user: {
              [key]: 'foo',
              data,
            },
          };
          const nextProps = { user: { data } };
          expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toEqual(true);
        });
      });
    });
  });

  describe('when there are extra or different keys on the nion resource', () => {
    it('should return false', () => {
      let prevProps = { user: { data: makeDataObject({ foo: 'bar' }) } };
      let nextProps = { user: { data: makeDataObject() } };

      expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toEqual(false);

      prevProps = { user: { data: makeDataObject({ foo: 'bar' }) } };
      nextProps = { user: { data: makeDataObject({ foo: 'baz' }) } };
      expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toEqual(false);

      prevProps = { user: { data: makeDataObject({ foo: 'bar' }) } };
      nextProps = { user: { data: makeDataObject({ baz: 'biz' }) } };
      expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toEqual(false);
    });
  });

  describe('request data', () => {
    const aTimestamp = Date.now();
    const aLaterTimestamp = aTimestamp + 100;

    describe('when the requests have different status or timestamps', () => {
      it('should return false', () => {
        const data = makeDataObject();
        let prevProps = { user: { data } };
        prevProps.user.request = Immutable({
          status: 'pending',
          fetchedAt: aTimestamp,
        });
        let nextProps = { user: { data } };
        nextProps.user.request = Immutable({
          status: 'success',
          fetchedAt: aLaterTimestamp,
        });
        expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toEqual(false);

        prevProps = { user: { data } };
        prevProps.user.request = Immutable({
          status: 'pending',
          fetchedAt: aTimestamp,
        });
        nextProps = { user: { data } };
        nextProps.user.request = Immutable({
          status: 'pending',
          fetchedAt: aLaterTimestamp,
        });
        expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toEqual(false);

        prevProps = { user: { data } };
        prevProps.user.request = Immutable({
          status: 'pending',
          fetchedAt: aTimestamp,
        });
        nextProps = { user: { data } };
        nextProps.user.request = Immutable({
          status: 'success',
          fetchedAt: aTimestamp,
        });
        expect(requestsAreEqual(prevProps.user.request, nextProps.user.request)).toEqual(false);
        expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toEqual(false);
      });
    });

    describe('when the requests all have the same status and timestamps', () => {
      const data = makeDataObject();
      let prevProps = { user: { data } };
      prevProps.user.request = Immutable({
        status: 'pending',
        fetchedAt: aTimestamp,
      });
      let nextProps = { user: { data } };
      nextProps.user.request = Immutable({
        status: 'pending',
        fetchedAt: aTimestamp,
      });
      it('should return true', () => {
        expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toEqual(true);
      });
      it('should pass a requestsAreEqual check', () => {
        expect(requestsAreEqual(prevProps.user.request, nextProps.user.request)).toBe(true);
      });
    });
  });

  describe('entity data', () => {
    describe('when the denormalized data object is empty', () => {
      let prevProps, nextProps;

      beforeEach(() => {
        prevProps = { user: { data: {} } };
        nextProps = { user: { data: {} } };
      });
      it('should return true', () => {
        expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toEqual(true);
      });
      it('should pass a dataAreEqual check', () => {
        expect(dataAreEqual(prevProps.user.data, nextProps.user.data)).toBe(true);
      });
    });

    describe('when the denormalized data objects are equal', () => {
      let data, prevProps, nextProps;

      beforeEach(() => {
        data = makeDataObject({ name: 'test' });
        prevProps = { user: { data } };
        nextProps = { user: { data } };
      });
      it('should return true', () => {
        expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toEqual(true);
      });
      it('should pass a dataAreEqual check', () => {
        expect(dataAreEqual(prevProps.user.data, nextProps.user.data)).toBe(true);
      });
    });

    describe('when the denormalized data objects are not equal', () => {
      let prevProps, nextProps;

      beforeEach(() => {
        prevProps = {
          user: { data: makeDataObject({ name: 'test' }) },
        };
        nextProps = {
          user: { data: makeDataObject({ name: 'other' }) },
        };
      });
      it('should return false', () => {
        expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toEqual(false);
      });
      it('should fail a dataAreEqual check', () => {
        expect(dataAreEqual(prevProps.user.data, nextProps.user.data)).toBeFalsy();
      });
    });
  });

  describe('extra data', () => {
    describe('when the extra data is all the same', () => {
      let data, extraLinks, extraMeta, prevProps, nextProps;

      beforeEach(() => {
        data = makeDataObject({ name: 'test' });
        extraLinks = { self: '' };
        extraMeta = { count: 25 };

        prevProps = { user: { data } };
        prevProps.user.extra = {
          links: extraLinks,
          meta: extraMeta,
        };

        nextProps = { user: { data } };
        nextProps.user.extra = {
          links: extraLinks,
          meta: extraMeta,
        };
      });
      it('should return true', () => {
        expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toEqual(true);
      });
      it('should pass an extrasAreEqual check', () => {
        expect(extrasAreEqual(prevProps.user.extra, nextProps.user.extra)).toEqual(true);
      });
    });

    describe('when the extra data has changed', () => {
      let data, extraLinks, extraMeta, prevProps, nextProps;

      beforeEach(() => {
        data = makeDataObject({ name: 'test' });
        extraLinks = { self: '' };
        extraMeta = { count: 25 };

        prevProps = { user: { data } };
        prevProps.user.extra = {
          links: extraLinks,
          meta: extraMeta,
        };

        nextProps = { user: { data } };
        extraLinks = { self: 'http://link.to.self' };
        nextProps.user.extra = {
          links: extraLinks,
          meta: extraMeta,
        };
      });
      it('should return false', () => {
        expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toEqual(false);
      });
      it('should fail an extrasAreEqual check', () => {
        expect(extrasAreEqual(prevProps.user.extra, nextProps.user.extra)).toEqual(false);
      });
    });

    describe('when the extra data has new keys', () => {
      let data, extraLinks, extraMeta, prevProps, nextProps;

      beforeEach(() => {
        data = makeDataObject({ name: 'test' });
        extraLinks = { self: '' };
        extraMeta = { count: 25 };

        prevProps = { user: { data } };
        prevProps.user.extra = {
          links: extraLinks,
          meta: extraMeta,
        };

        nextProps = { user: { data } };
        extraLinks = {
          self: 'http://link.to.self',
          next: 'http://link.to.next',
        };
        nextProps.user.extra = {
          links: extraLinks,
          meta: extraMeta,
        };
      });
      it('should return false', () => {
        expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toEqual(false);
      });
      it('should fail an extrasAreEqual check', () => {
        expect(extrasAreEqual(prevProps.user.extra, nextProps.user.extra)).toEqual(false);
      });
    });
  });

  describe('extensions metadata', () => {
    describe('when extensions not significantly changed', () => {
      let data, prevProps, nextProps;

      beforeEach(() => {
        data = makeDataObject();
        prevProps = {
          user: {
            data,
            extensions: {
              foo: makeExtension({}, { bar: 'baz' }),
            },
          },
        };
        nextProps = {
          user: {
            data,
            extensions: {
              foo: makeExtension({}, { bar: 'baz' }),
            },
          },
        };
      });

      it('should return true', () => {
        expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toBe(true);
      });
      it('should pass an extensionsAreEqual check', () => {
        expect(extensionsAreEqual(prevProps.user.extensions, nextProps.user.extensions)).toBe(true);
      });
    });

    describe('when extension meta has changed', () => {
      let data, prevProps, nextProps;

      beforeEach(() => {
        data = makeDataObject();
        prevProps = {
          user: {
            data,
            extensions: {
              foo: makeExtension({}, { bar: 'baz' }),
            },
          },
        };
        nextProps = {
          user: {
            data,
            extensions: {
              foo: makeExtension({}, { bar: 'farb' }),
            },
          },
        };
      });

      it('should return false', () => {
        expect(areMergedPropsEqual(nionize(prevProps), nionize(nextProps))).toBe(false);
      });
      it('should fail an extensionsAreEqual check', () => {
        expect(extensionsAreEqual(prevProps.user.extensions, nextProps.user.extensions)).toBe(false);
      });
    });
  });
});
