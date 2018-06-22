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

    registerMethods(methods = {}) {
        this._onRequest = methods.onRequest
        this._onSuccess = methods.onSuccess
        this._onFailure = methods.onFailure
        this._onDeclare = methods.onDeclare
    }
}

export default new Lifecycle()
