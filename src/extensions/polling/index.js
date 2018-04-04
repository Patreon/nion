import get from 'lodash.get'

export const intervalMap = {}

export default {
    composeActions: (options, resource) => {
        const { key, delay } = options

        return {
            start: (params, actionOptions) => {
                intervalMap[key] = setInterval(
                    () => resource.actions.get(params, actionOptions),
                    delay,
                )
            },

            stop: () => {
                clearInterval(intervalMap[key])
                intervalMap[key] = null
            },
        }
    },

    composeMeta: (options, resource) => {
        return {
            isActive: () => (get(intervalMap, options.key) ? true : false),
        }
    },
}
