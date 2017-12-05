import get from 'lodash.get'
import mapValues from 'lodash.mapvalues'

export default {
    composeActions: (options, resource) => {
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

    composeMeta: (options, resource) => {
        if (get(resource, 'extra.links.next')) {
            return { canLoadMore: true }
        }
        return {}
    },
}
