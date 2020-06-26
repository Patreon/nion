import { useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useMappedState } from 'redux-react-hook'
import get from 'lodash.get'

import { getUrl } from '../utilities/get-url'
import { selectResourcesForKeys } from '../selectors'
import nionActions from '../actions'
import { INITIALIZE_DATAKEY, UPDATE_REF } from '../actions/types'
import { makeRef } from '../transforms'

function useNion(declaration, deps = []) {
    const dispatch = useDispatch()

    // convert `useNion('currentUser') => useNion({dataKey: 'currentUser'})`
    const coercedDeclaration = useMemo(() => {
        return typeof declaration === 'string'
            ? { dataKey: declaration }
            : declaration
        // eslint-disable-next-line
    }, deps)

    const selectNionResourcesForDataKeys = useMemo(() => {
        return selectResourcesForKeys([coercedDeclaration.dataKey], true)
    }, [coercedDeclaration.dataKey])

    const mapStateToProps = useCallback(
        state => ({
            nion: selectNionResourcesForDataKeys(state)[
                coercedDeclaration.dataKey
            ],
        }),
        [coercedDeclaration.dataKey, selectNionResourcesForDataKeys],
    )

    // get entity, request, and extra data from the store
    const { nion } = useMappedState(mapStateToProps)

    const getResources = useCallback(
        (params, actionOptions = {}) => {
            const endpoint = getUrl(coercedDeclaration, params)
            return nionActions.get(coercedDeclaration.dataKey, {
                declaration: coercedDeclaration,
                endpoint,
                meta: {
                    append: get(actionOptions, 'append'),
                    appendKey: get(actionOptions, 'appendKey'),
                },
            })(dispatch)
        },
        [coercedDeclaration, dispatch],
    )

    const postResource = useCallback(
        (body = {}, params, actionOptions) => {
            const endpoint = getUrl(coercedDeclaration, params)

            return nionActions.post(coercedDeclaration.dataKey, {
                endpoint,
                declaration: coercedDeclaration,
                body,
                meta: {
                    append: get(actionOptions, 'append'),
                    appendKey: get(actionOptions, 'appendKey'),
                },
            })(dispatch)
        },
        [coercedDeclaration, dispatch],
    )

    const putResource = useCallback(
        (body = {}, params, actionOptions) => {
            const endpoint = getUrl(coercedDeclaration, params)

            return nionActions.put(coercedDeclaration.dataKey, {
                endpoint,
                declaration: coercedDeclaration,
                body,
                meta: {
                    append: get(actionOptions, 'append'),
                    appendKey: get(actionOptions, 'appendKey'),
                },
            })(dispatch)
        },
        [coercedDeclaration, dispatch],
    )

    const patchResource = useCallback(
        (body = {}, params) => {
            const endpoint = getUrl(coercedDeclaration, params)
            return nionActions.patch(coercedDeclaration.dataKey, {
                endpoint,
                declaration: coercedDeclaration,
                body,
            })(dispatch)
        },
        [coercedDeclaration, dispatch],
    )

    const deleteDispatchFn = useCallback(
        (refToDelete = {}, params, options = {}) => {
            // TODO: Refactor ref to delete to not be mutative.
            if (options.refToDelete) {
                refToDelete = options.refToDelete
            }
            const endpoint = getUrl(coercedDeclaration, params)
            return nionActions.delete(coercedDeclaration.dataKey, {
                ...options,
                declaration: coercedDeclaration,
                endpoint,
                refToDelete,
            })(dispatch)
        },
        [coercedDeclaration, dispatch],
    )

    const updateRef = useCallback(
        ref => {
            return dispatch({
                type: UPDATE_REF,
                payload: {
                    ref: makeRef(ref),
                },
                meta: {
                    dataKey: coercedDeclaration.dataKey,
                },
            })
        },
        [coercedDeclaration.dataKey, dispatch],
    )

    const updateEntity = useCallback(
        ({ type, id }, attributes) => {
            return dispatch(nionActions.updateEntity({ type, id }, attributes))
        },
        [dispatch],
    )

    const ref = useMemo(
        () => (nion.obj ? { id: nion.obj.id, type: nion.obj.type } : null),
        [nion.obj],
    )

    const deleteResource = useCallback(
        (props, options) => deleteDispatchFn(ref, props, options),
        [ref, deleteDispatchFn],
    )

    useEffect(() => {
        if (coercedDeclaration.fetchOnMount) {
            getResources()
        }
    }, [coercedDeclaration.fetchOnMount, getResources])

    const actions = useMemo(
        () => ({
            get: getResources,
            put: putResource,
            post: postResource,
            patch: patchResource,
            delete: deleteResource,
            updateRef,
            updateEntity,
        }),
        [
            getResources,
            putResource,
            postResource,
            patchResource,
            deleteResource,
            updateRef,
            updateEntity,
        ],
    )

    const initializeDataKey = useCallback(
        (dataKey, daRef) =>
            dispatch({
                type: INITIALIZE_DATAKEY,
                payload: { ref: daRef },
                meta: { dataKey },
            }),
        [dispatch],
    )
    // pull existing data from store by ref if you need to
    useEffect(() => {
        if (!nion.obj) {
            initializeDataKey(
                coercedDeclaration.dataKey,
                coercedDeclaration.initialRef,
            )
        }
    }, [
        coercedDeclaration.dataKey,
        coercedDeclaration.initialRef,
        initializeDataKey,
        nion.obj,
    ])

    return [nion.obj, actions, nion.request, nion.extra]
}

export default useNion
