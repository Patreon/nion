'use strict';

var _index = require('./index');

describe('nion/url : buildUrl & deconstructUrl', function () {
    it.skip('Builds a url from an endpoint, with no defaults', function () {
        var path = '/test';
        var url = (0, _index.buildUrl)(path);

        var _deconstructUrl = (0, _index.deconstructUrl)(url),
            options = _deconstructUrl.options,
            pathname = _deconstructUrl.pathname;

        expect(pathname).toEqual(path);
        expect(options.include).toHaveLength(0);
    });

    it.skip('Builds a url from an endpoint, with include', function () {
        var path = '/test';
        var included = 'relationship';
        var url = (0, _index.buildUrl)(path, { include: [included] });

        var _deconstructUrl2 = (0, _index.deconstructUrl)(url),
            options = _deconstructUrl2.options;

        expect(options.include).toHaveLength(1);
        expect(options.include[0]).toEqual(included);
    });

    it.skip('Builds a url from an endpoint, with fields', function () {
        var path = '/test';
        var field = 'name';
        var url = (0, _index.buildUrl)(path, { fields: { user: field } });

        var _deconstructUrl3 = (0, _index.deconstructUrl)(url),
            options = _deconstructUrl3.options;

        expect(options.fields).toBeDefined();
        expect(options.fields.user).toEqual(field);
    });
});