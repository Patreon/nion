import { buildUrl, deconstructUrl } from './index'

describe('nion/url : buildUrl & deconstructUrl', () => {
    it.skip('Builds a url from an endpoint, with no defaults', () => {
        const path = '/test'
        const url = buildUrl(path)
        const { options, pathname } = deconstructUrl(url)

        expect(pathname).toEqual(path)
        expect(options.include).toHaveLength(0)
    })

    it.skip('Builds a url from an endpoint, with include', () => {
        const path = '/test'
        const included = 'relationship'
        const url = buildUrl(path, { include: [ included ] })
        const { options } = deconstructUrl(url)

        expect(options.include).toHaveLength(1)
        expect(options.include[0]).toEqual(included)
    })

    it.skip('Builds a url from an endpoint, with fields', () => {
        const path = '/test'
        const field = 'name'
        const url = buildUrl(path, { fields: { user: field } })
        const { options } = deconstructUrl(url)

        expect(options.fields).toBeDefined()
        expect(options.fields.user).toEqual(field)
    })
})
