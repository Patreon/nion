// Simple pre/post request hooks (must return a promise) and a request parameter helper
export const beforeRequest = (method, options) => {
    return Promise.resolve()
}

export const afterRequest = (method, options) => {
    return Promise.resolve()
}

export const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json, application/xml, text/plain, text/html, *.*',
}

export const getRequestParameters = (_method, { declaration = {} } = {}) => {
    return {
        headers: declaration.headers || defaultHeaders,
    }
}
