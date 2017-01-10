const apiMap = {}

export const selectApi = (requestType) => {
    if (apiMap.hasOwnProperty(requestType)) {
        return apiMap[requestType]
    }
    throw new Error(`Request type ${requestType} is not supported by nion, using 'api'.`)
    return apiMap('api')
}


export const registerApi = (name, api) => {
    apiMap[name] = api
}
