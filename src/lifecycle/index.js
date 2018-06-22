export class Lifecycle {
    onRequest(method, dataKey, request, meta, declaration) {
        return (
            this._onRequest &&
            this._onRequest(method, dataKey, request, meta, declaration)
        )
    }

    onSuccess(method, dataKey, request, response, meta, declaration) {
        return (
            this._onSuccess &&
            this._onSuccess(
                method,
                dataKey,
                request,
                response,
                meta,
                declaration,
            )
        )
    }

    onFailure(method, dataKey, error, meta, declaration) {
        return (
            this._onFailure &&
            this._onFailure(method, dataKey, error, meta, declaration)
        )
    }

    onDeclare(declaration, props) {
        return this._onDeclare && this._onDeclare(declaration, props)
    }

    registerLifecycleConfig(lifecycleConfig = {}) {
        this._onRequest = lifecycleConfig.onRequest
        this._onSuccess = lifecycleConfig.onSuccess
        this._onFailure = lifecycleConfig.onFailure
        this._onDeclare = lifecycleConfig.onDeclare
    }
}

export default new Lifecycle()
