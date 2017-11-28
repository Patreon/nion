import get from 'lodash.get'

export const intervalMap = {}

export default {
    generateActions: (options, resource) => {
        const { key, delay } = options

        return {
            pollStart: (params, actionOptions) => {
                intervalMap[key] = setInterval(
                    () => resource.actions.get(params, actionOptions),
                    delay,
                )
            },

            pollStop: () => {
                clearInterval(intervalMap[key])
                intervalMap[key] = null
            },
        }
    },

    generateMeta: (options, resource) => {
        const { key } = options
        return { polling: get(intervalMap, key) ? true : false }
    },
}
