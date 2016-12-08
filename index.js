import decorator from './decorator'
import * as url from './url'
import * as selectors from './selectors'
import * as actions from './actions'
import * as transforms from './transforms'

export default decorator

export const { buildUrl } = url
export const { selectData, selectRequest } = selectors
export const { jsonApi } = actions
export const { makeRef } = transforms
