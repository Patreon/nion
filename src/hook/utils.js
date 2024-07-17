import { useRef, useEffect } from 'react';

export function useDebug(deps) {
  const prev = useRef([]);

  useEffect(() => {
    const returned = deps;

    // TODO (legacied no-unused-expressions)
    // This failure is legacied in and should be updated. DO NOT COPY.
    // eslint-disable-next-line no-unused-expressions
    prev.current.length
      ? // TODO (legacied no-console)
        // This failure is legacied in and should be updated. DO NOT COPY.
        // eslint-disable-next-line no-console
        returned.forEach((r, i) => r !== prev.current[i] && console.log('r !== p[i]', r, prev.current[i], i))
      : 'initial render';
    prev.current = returned;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
