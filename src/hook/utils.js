import { useRef, useEffect } from 'react'

export function useDebug(deps) {
    const prev = useRef([])

    useEffect(() => {
        const returned = deps

        prev.current.length
            ? returned.forEach(
                  (r, i) =>
                      r !== prev.current[i] &&
                      console.log('r !== p[i]', r, prev.current[i], i),
              )
            : 'initial render'
        prev.current = returned
        // eslint-disable-next-line
    }, deps)
}
