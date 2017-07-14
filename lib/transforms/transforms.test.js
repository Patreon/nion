'use strict';

var _index = require('./index');

describe('nion/transforms : makeRef', function () {
    var id = '123';
    var type = 'user';

    describe('when given an object with an attached _ref', function () {
        it('makes a ref from a singular { id, type } tuple', function () {
            var data = {
                _ref: {
                    data: { id: id, type: type }
                }
            };
            var result = (0, _index.makeRef)(data);
            var entities = result.entities,
                isCollection = result.isCollection,
                links = result.links,
                meta = result.meta;

            expect(entities).toHaveLength(1);
            expect(entities[0]).toMatchObject({ id: id, type: type });
            expect(isCollection).toEqual(false);
            expect(links).toBeUndefined();
            expect(meta).toBeUndefined();
        });

        it('makes a ref from an array of { id, type } tuples', function () {
            var data = {
                _ref: {
                    data: [{ id: id, type: type }, { id: id, type: type }]
                }
            };

            var _makeRef = (0, _index.makeRef)(data),
                entities = _makeRef.entities,
                isCollection = _makeRef.isCollection;

            expect(entities).toHaveLength(2);
            expect(entities[0]).toMatchObject({ id: id, type: type });
            expect(entities[1]).toMatchObject({ id: id, type: type });
            expect(isCollection).toEqual(true);
        });

        it('uses the passed in isCollection property', function () {
            var data = {
                _ref: {
                    data: { id: id, type: type },
                    isCollection: true
                }
            };

            var _makeRef2 = (0, _index.makeRef)(data),
                entities = _makeRef2.entities,
                isCollection = _makeRef2.isCollection;

            expect(entities).toHaveLength(1);
            expect(isCollection).toEqual(true);
        });

        it('uses the passed in meta property', function () {
            var data = {
                _ref: {
                    data: { id: id, type: type },
                    meta: { count: 1 }
                }
            };

            var _makeRef3 = (0, _index.makeRef)(data),
                meta = _makeRef3.meta;

            expect(meta).toMatchObject({ count: 1 });
        });

        it('uses the passed in links property', function () {
            var data = {
                _ref: {
                    data: { id: id, type: type },
                    links: { next: 'next' }
                }
            };

            var _makeRef4 = (0, _index.makeRef)(data),
                links = _makeRef4.links;

            expect(links).toMatchObject({ next: 'next' });
        });
    });

    describe('when given data without an underlying _ref', function () {
        it('makes a ref from an object with id and type', function () {
            var data = {
                id: id,
                type: type
            };
            var result = (0, _index.makeRef)(data);
            var entities = result.entities,
                isCollection = result.isCollection,
                links = result.links,
                meta = result.meta;

            expect(entities).toHaveLength(1);
            expect(entities[0]).toMatchObject({ id: id, type: type });
            expect(isCollection).toEqual(false);
            expect(links).toBeUndefined();
            expect(meta).toBeUndefined();
        });

        it('makes a ref from an array of objects with id and type', function () {
            var data = [{
                id: id,
                type: type
            }];
            var result = (0, _index.makeRef)(data);
            var entities = result.entities,
                isCollection = result.isCollection;

            expect(entities).toHaveLength(1);
            expect(entities[0]).toMatchObject({ id: id, type: type });
            expect(isCollection).toEqual(true);
        });

        it('allows isCollection to be set manually through an option', function () {
            // This property is useful for setting an initial ref that is singular at the time of
            // instantiation, but will eventually be plural, ie a firstReply
            var data = {
                id: id,
                type: type
            };
            var result = (0, _index.makeRef)(data, { isCollection: true });
            var entities = result.entities,
                isCollection = result.isCollection;

            expect(entities).toHaveLength(1);
            expect(entities[0]).toMatchObject({ id: id, type: type });
            expect(isCollection).toEqual(true);
        });

        it('makes an empty ref when given invalid / nonexistent data', function () {
            var data = {};
            var result = (0, _index.makeRef)(data);
            var entities = result.entities;

            expect(entities).toHaveLength(0);
        });
    });
});