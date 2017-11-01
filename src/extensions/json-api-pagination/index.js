import mapValues from 'lodash.mapvalues'

export default {
    generateActions: (options, resource) => {
        const { extra } = resource

        // Generate pagination functions from available links
        return mapValues(extra.links, (link, key) => {
            return {
                method: 'GET',
                params: { endpoint: link },
            }
        })
    },
}
