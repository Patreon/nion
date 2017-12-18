import { ensureLinkHasProtocol } from '../utilities'

let location

describe('ensureLinkHasProtocol', () => {
    location = document.location.href

    // Fun hack to get around jest's `document.location` implementation
    // https://github.com/facebook/jest/issues/890
    beforeAll(() => {
        const parser = document.createElement('a')
        const PROPERTIES = ['href', 'protocol']

        PROPERTIES.forEach(prop => {
            Object.defineProperty(document.location, prop, {
                get: function() {
                    parser.href = location
                    return parser[prop]
                },
            })
        })
    })

    it('passes links with protocols on unchanged', () => {
        const link = 'ftp://api.stuff.com/'
        expect(ensureLinkHasProtocol(link)).toEqual(link)
    })

    it('adds "http:" to links without protocols', () => {
        location = 'patreon.com/'
        const link = 'api.stuff.com/'
        expect(ensureLinkHasProtocol(link)).toEqual('http://api.stuff.com/')
    })

    it('retains path, query, and hash on links when rebuilding', () => {
        location = 'patreon.com/'
        const link = 'api.stuff.com/search?q=thing&stuff=okay#cool'
        expect(ensureLinkHasProtocol(link)).toEqual(
            'http://api.stuff.com/search?q=thing&stuff=okay#cool',
        )
    })

    it('has awareness of global location and any protocol defined there', () => {
        location = 'https://patreon.com/'
        const link = 'api.stuff.com/'
        expect(ensureLinkHasProtocol(link)).toEqual('https://api.stuff.com/')
    })
})
