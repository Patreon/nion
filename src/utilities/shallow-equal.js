// shallow equal from fbjs
// https://github.com/reactjs/react-redux/blob/master/src/utils/shallowEqual.js
// modified to ignore the "nion" prop

const hasOwn = Object.prototype.hasOwnProperty

function is(x, y) {
    if (x === y) {
        return x !== 0 || y !== 0 || 1 / x === 1 / y
    } else {
        return x !== x && y !== y
    }
}

export default function shallowEqual(objA, objB) {
    if (is(objA, objB)) return true

    if (
        typeof objA !== 'object' ||
        objA === null ||
        typeof objB !== 'object' ||
        objB === null
    ) {
        return false
    }

    const keysA = Object.keys(objA)
    const keysB = Object.keys(objB)

    if (keysA.length !== keysB.length) return false

    for (let i = 0; i < keysA.length; i++) {
        const key = keysA[i]

        if (!hasOwn.call(objB, key) || !is(objA[key], objB[key])) {
            return false
        }
    }

    return true
}
