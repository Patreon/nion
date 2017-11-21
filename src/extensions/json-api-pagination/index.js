import mapValues from 'lodash.mapvalues'

export default {
    generateActions: (options, resource) => {
        const { append = false } = options
        const { actions, extra } = resource

        // Generate an action for each available link on the resource
        return mapValues(extra.links, (link, key) => {
            switch (key) {
                case 'next':
                    return () =>
                        actions.get(
                            {
                                endpoint: link,
                            },
                            { append },
                        )
                    break
                default:
                    return () =>
                        actions.get({
                            endpoint: link,
                        })
            }
        })
    },

    generateMeta: (options, resource) => {},
}
