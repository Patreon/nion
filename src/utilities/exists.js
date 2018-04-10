// Test for the existence of a nion[key] object. If we don't yet have any data attached to a
// dataKey, nion will still pass down an empty object with "request" and "actions" props in order to
// manage loading the corresponding data. This method tests to see if that object has data
// associated with it.
export default function exists(input = {}) {
    if (input === null || typeof input === 'undefined') {
        return false
    }

    if (typeof input.data !== 'undefined' && input.data === null) {
        return false
    }

    return true
}
