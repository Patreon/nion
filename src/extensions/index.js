import map from 'lodash.map'
import * as includedExtensions from './manifest'

class ExtensionManager {
    extensionMap = {}

    constructor() {
        map(includedExtensions, (extension, name) => {
            this.registerExtension(name, extension)
        })
    }

    getExtension = name => {
        if (this.extensionMap[name]) {
            return this.extensionMap[name]
        }
        throw new Error(
            `Extension ${name} is not registered with nion. Add a corresponding extension module to nion.configureNion`,
        )
    }

    getActions = (name, options, resource) => {
        return this.getExtension(name).generateActions(options, resource)
    }

    registerExtension = (name, extension) => {
        this.extensionMap[name] = extension
    }
}

export default new ExtensionManager()
