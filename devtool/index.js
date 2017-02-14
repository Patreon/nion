import { selectData } from '../selectors'

export default function initializeNionDevTool(store) {
    window.nion = {
        selectData(key) {
            return selectData(key)(store.getState())
        }
    }
}
