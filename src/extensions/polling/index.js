import get from 'lodash.get'

export const intervalMap = {}

export default {
    generateActions: (options, resource) => {
        const { key, delay } = options

        return {
            poll: (params, actionOptions) => {
                intervalMap[key] = setInterval(
                    () => resource.actions.get(params, actionOptions),
                    delay,
                )
            },

            unpoll: () => {
                clearInterval(intervalMap[key])
                intervalMap[key] = null
            },
        }
    },

    generateMeta: (options, resource) => {
        return { polling: get(intervalMap, options.key) ? true : false }
    },
}
