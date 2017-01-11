import { camelizeKeys } from 'humps'

export const parseApiResponse = (response) => {
    return {
        entryRef: camelizeKeys(response)
    }
}

export default parseApiResponse
