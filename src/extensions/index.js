import map from 'lodash.map'
import * as includedExtensions from './manifest'

class ExtensionManager {
    extensionMap = {}

    constructor() {
        map(includedExtensions, (extension, name) => {
            if (!extension.composeActions || !extension.composeMeta) {
                throw new Error(
                    `Extension "${name}" isn't correctly shaped. It should generate both actions and meta values, even if they're just empty objects.`,
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
            `Extension "${name}" is not registered with nion. Add a corresponding extension module to nion.configureNion`,
        )
    }

    composeActionsForExtension = (name, options, resource) => {
        return this.getExtension(name).composeActions(options, resource)
    }

    composeMetaForExtension = (name, options, resource) => {
        return this.getExtension(name).composeMeta(options, resource)
    }

    registerExtension = (name, extension) => {
        this.extensionMap[name] = extension
    }
}

export default new ExtensionManager()
