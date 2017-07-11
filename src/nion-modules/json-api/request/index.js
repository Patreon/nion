import { getCsrfHeaders } from '../../../utilities/csrf'

export class JsonApiPayload {
    constructor(type, attributes) {
        this.attributes = { ...attributes }
        this.relationships = {}
        this.meta = {}
        this.type = type
        this.included = []
    }

    addAttribute(key, val) {
        this.attributes[key] = val
    }

    // Relationship can either be a { type, id } object or [{ type, id }] array of objects - or, if
    // 'idOrData' is a string, then we can assume that we're passing in arguments of (type, id) and
    // the  relationship is simple
    addRelationship(relationship, idOrData) {
        let data
        if (typeof idOrData === 'string') {
            data = { type: relationship, id: idOrData }
        } else {
            data = idOrData
        }
        this.relationships[relationship] = { data }
    }

    addMetaAttribute(key, val) {
        this.meta[key] = val
    }

    addInclude(type, id, attributes) {
        this.addRelationship(type, id)
        this.included.push({
            type,
            id,
            attributes: { ...attributes },
        })
    }

    toRequest() {
        let request = {}
        request['data'] = {
            type: this.type,
            attributes: { ...this.attributes },
            relationships: { ...this.relationships },
        }

        if (Object.keys(this.meta).length) {
            request['meta'] = { ...this.meta }
        }

        if (this.included.length) {
            request['included'] = [...this.included]
        }
        return request
    }
}

export const beforeRequest = (method, options) => {
    return Promise.resolve()
}

export const afterRequest = (method, options) => {
    return Promise.resolve()
}

export const getRequestParameters = (method, options) => {
    return Promise.resolve()
        .then(() => {
            const skipMethods = {
                get: true,
                options: true,
            }
            if (skipMethods[method.toLowerCase()]) {
                return
            }

            return getCsrfHeaders()
        })
        .then(headers => ({
            credentials: 'include',
            headers: {
                ...headers,
                'Content-Type': 'application/vnd.api+json',
            },
        }))
}
