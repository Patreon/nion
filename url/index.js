import ApiManager from '../api'

export const buildUrl = (...args) => {
    const defaultApi = ApiManager.getDefaultApi()
    const defaultBuildUrl = ApiManager.getBuildUrl(defaultApi)
    return defaultBuildUrl(...args)
}

export const urlBuilder = (...args) => {
    const defaultApi = ApiManager.getDefaultApi()
    const defaultBuildUrl = ApiManager.getBuildUrl(defaultApi)
    return () => {
        defaultBuildUrl(...args)
    }
}
