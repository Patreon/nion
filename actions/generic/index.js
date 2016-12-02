import { GENERIC_BOOTSTRAP } from '../types'

export const bootstrapGeneric = ({ dataKey, data }) => {
    return {
        type: GENERIC_BOOTSTRAP,
        meta: { dataKey },
        payload: data
    }
}
