import { combineReducers } from 'redux'

import references from './references'
import requests from './requests'
import entities from './entities'

export default combineReducers({
    references,
    requests,
    entities
})
