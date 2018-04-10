import map from 'lodash.map'
import get from 'lodash.get'

import getDefaultDeclarationOptions from './get-default-declaration-options'

const processDefaultOptions = declarations => {
    map(declarations, (declaration, key) => {
        map(getDefaultDeclarationOptions(), (defaultState, defaultKey) => {
            const option = get(declaration, defaultKey, defaultState)
            declaration[defaultKey] = option
        })
    })
}

export default processDefaultOptions
