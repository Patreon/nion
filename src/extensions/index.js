import map from 'lodash.map'
import * as includedExtensions from './manifest'

class ExtensionManager {
    extensionMap = {}

    constructor() {
        map(includedExtensions, (extension, name) => {
            if (!extension.generateActions || !extension.generateMeta) {
                throw new Error(
                    `Extension ${name} isn't correctly shaped. It should generate both actions and meta values, even if they're just empty objects.`,
                )
            }
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

    generateActionsForExtension = (name, options, resource) => {
        return this.getExtension(name).generateActions(options, resource)
    }

    generateMetaForExtension = (name, options, resource) => {
        return this.getExtension(name).generateMeta(options, resource)
    }

    registerExtension = (name, extension) => {
        this.extensionMap[name] = extension
    }
}

export default new ExtensionManager()
