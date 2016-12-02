import { getData } from './selectors'

export default function initializeNionDevTool(store) {
    window.nion = {
        getData(key) {
            return getData(key)(store.getState())
        }
    }
}
