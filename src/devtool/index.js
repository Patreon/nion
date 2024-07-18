import { nionHookStats } from './hooks';

import { selectData } from '../selectors';

let isInitialized = false;

// TODO (legacied import/no-default-export)
// This failure is legacied in and should be updated. DO NOT COPY.
// eslint-disable-next-line import/no-default-export
export default function initializeNionDevTool(store) {
  if (window) {
    window.nion = {
      hooks: nionHookStats,
      selectData(key) {
        return selectData(key)(store.getState());
      },
    };

    isInitialized = true;
  }
}

export function isDevtoolEnabled() {
  return isInitialized;
}
