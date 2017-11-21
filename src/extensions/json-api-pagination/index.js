import get from 'lodash.get'
import mapValues from 'lodash.mapvalues'

export default {
    generateActions: (options, resource) => {
        const { append = false } = options
        const { actions, extra } = resource

        // Generate an action for each available link on the resource
        return mapValues(extra.links, (link, key) => {
            switch (key) {
                case 'next':
                    return (params, actionOptions) =>
                        actions.get(
                            { ...params, endpoint: link },
                            { ...actionOptions, append },
                        )
                    break
                default:
                    return (params, actionOptions) =>
                        actions.get(
                            { ...params, endpoint: link },
                            actionOptions,
                        )
            }
        })
    },

    generateMeta: (options, resource) => {
        return {
            canLoadMore: get(resource, 'extra.links.next') ? true : false,
        }
    },
}
