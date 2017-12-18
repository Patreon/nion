import get from 'lodash.get'
import url from 'url'

// Add a protocol to link URLs if there isn't one
export const ensureLinkHasProtocol = link => {
    const urlMap = url.parse(link)
    const locationProtocol = get(document, 'location.protocol')
    const linkProtocol = locationProtocol === ':' ? 'http:' : locationProtocol

    if (!get(urlMap, 'protocol')) {
        return `${linkProtocol}//${urlMap.path}${urlMap.hash || ''}`
    } else {
        return link
    }
}
