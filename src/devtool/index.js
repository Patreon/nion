import { nionHookStats } from './hooks'

import { selectData } from '../selectors'

let isInitialized = false

export default function initializeNionDevTool(store) {
    if (window) {
        window.nion = {
            hooks: nionHookStats,
            selectData(key) {
                return selectData(key)(store.getState())
            },
        }

        isInitialized = true
    }
}

export function isDevtoolEnabled() {
    return isInitialized
}
