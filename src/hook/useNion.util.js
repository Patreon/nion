let lastDecl
let lastDispatch
let lastResult = []
let lastResultChanged = {
    obj: -1,
    actions: -1,
    request: -1,
    extra: -1,
}

// const TRACKED_DATAKEY = 'campaignPosts'
const TRACKED_DATAKEY = 'currentUser'

if (window) {
    window.NION_HOOK_CALLS = 0
    window.NION_HOOK_CB_CALLS = 0
    window.NION_DATAKEYS = []
    window.NION_DATAKEY_CHANGED = ''
    window.NION_DATAKEY_HOOK_CALLS = 0
    window.NION_DATAKEY_REFS = 0
    window.NION_DECLARATION_CHANGED = -1
    window.NION_DECLARATIONS = []
    window.NION_DISPATCH_CHANGED = -1
    window.NION_NUM_COLLECTIONS = 0
    window.NION_STATE_UPDATED = 0
}

export function withDebug(props, dataKey, decl, dispatch) {
    if (!window) return props

    window.NION_HOOK_CALLS++

    if (window.NION_DATAKEYS.indexOf(dataKey) === -1) {
        window.NION_DATAKEYS.push(dataKey)
    }

    if (window.NION_DECLARATIONS.indexOf(decl) === -1) {
        window.NION_DECLARATIONS.push(decl)
    }

    if (dataKey === TRACKED_DATAKEY) {
        window.NION_DATAKEY_HOOK_CALLS++

        if (!Object.is(decl, lastDecl)) {
            lastDecl = decl
            window.NION_DECLARATION_CHANGED++
        }

        if (!Object.is(dispatch, lastDispatch)) {
            lastDispatch = dispatch
            window.NION_DISPATCH_CHANGED++
        }

        if (lastResult) {
            if (!Object.is(lastResult[0], props[0])) {
                lastResultChanged.obj++
            }

            if (!Object.is(lastResult[1], props[1])) {
                lastResultChanged.actions++
            }

            if (!Object.is(lastResult[2], props[2])) {
                lastResultChanged.request++
            }

            if (!Object.is(lastResult[3], props[3])) {
                lastResultChanged.extra++
            }
        }

        window.NION_DATAKEY_CHANGED = `${TRACKED_DATAKEY} (${
            window.NION_DATAKEY_HOOK_CALLS
        } / ${window.NION_HOOK_CALLS} hook calls): [declaration:${
            window.NION_DECLARATION_CHANGED
        }, dispatch:${window.NION_DISPATCH_CHANGED}] [obj:${
            lastResultChanged.obj
        }, actions:${lastResultChanged.actions}, request:${
            lastResultChanged.request
        }, extra:${lastResultChanged.extra}]`

        window.NION_LAST_RESULT = props

        lastResult = props
    }

    return props
}
