import { selectData } from '../selectors'

export default function initializeNionDevTool(store) {
    if (window) {
        window.nion = {
            selectData(key) {
                return selectData(key)(store.getState())
            }
        }
    }
}
