import { camelizeKeys } from 'humps'

// The default api module doesn't normalize the data, it simply attaches it to the ref
export const parseApiResponse = response => {
    return {
        entryRef: camelizeKeys(response),
    }
}

export default parseApiResponse
