class ExtensionManager {
    extensionMap = {}

    validateExtension = extension => {
        if (!extension.composeActions || !extension.composeMeta) {
            throw new Error(
                `Extension "${name}" isn't correctly shaped. It should generate both actions and meta values, even if they're just empty objects.`,
            )
        }
        return true
    }

    validateName = name => {
        if (!name.match(/^[a-z][a-zA-Z0-9]+$/)) {
            throw new Error(
                `"${name}" isn't an acceptable extension name. Use alphanumeric characters only and start with lowercase letter.`,
            )
        }
        return true
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
        if (this.validateExtension(extension) && this.validateName(name)) {
            this.extensionMap[name] = extension
        }
    }
}

export default new ExtensionManager()
