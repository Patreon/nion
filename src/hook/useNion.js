import { useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useMappedState } from 'redux-react-hook'
import get from 'lodash.get'
import omit from 'lodash.omit'

import { selectResourcesForKeys } from '../selectors'
import nionActions from '../actions'
import ApiManager from '../api'
import { INITIALIZE_DATAKEY, UPDATE_REF } from '../actions/types'
import { makeRef } from '../transforms'

function useNion(declaration, deps = []) {
    const dispatch = useDispatch()

    // convert `useNion('currentUser') => useNion({dataKey: 'currentUser'})`
    const coercedDeclaration = useMemo(
        () => {
            return typeof declaration === 'string'
                ? { dataKey: declaration }
                : declaration
        },
        deps,
    )

    const selectNionResourcesForDataKeys = useMemo(
        () => {
            return selectResourcesForKeys([coercedDeclaration.dataKey], true)
        },
        [coercedDeclaration],
    )

    const mapStateToProps = useCallback(
        state => ({
            nion: selectNionResourcesForDataKeys(state)[
                coercedDeclaration.dataKey
            ],
        }),
        [selectNionResourcesForDataKeys, coercedDeclaration.dataKey],
    )

    // get entity, request, and extra data from the store
    const { nion } = useMappedState(mapStateToProps)

    // copy pasta from decorator
    function getUrl(passedDeclaration, params) {
        let endpoint = get(passedDeclaration, 'endpoint')
        const buildUrl = ApiManager.getBuildUrl(passedDeclaration.apiType)

        // If supplied endpoint override at call time, then use the supplied endpoint
        if (get(params, 'endpoint')) {
            endpoint = params.endpoint
            params = omit(params, ['endpoint'])
        }

        // Use if a fully-formed url, otherwise pass to buildUrl
        return typeof buildUrl === 'undefined' ||
            typeof endpoint === 'undefined' ||
            endpoint.indexOf('https://') === 0 ||
            endpoint.indexOf('http://') === 0
            ? endpoint
            : buildUrl(endpoint, params)
    }

    const getResources = useCallback(
        (params, actionOptions = {}) => {
            const endpoint = getUrl(coercedDeclaration, params)
            return nionActions.get(coercedDeclaration.dataKey, {
                declaration: coercedDeclaration,
                endpoint,
                meta: {
                    append: get(actionOptions, 'append'),
                },
            })(dispatch)
        },
        [coercedDeclaration],
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
                },
            })(dispatch)
        },
        [coercedDeclaration],
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
        [coercedDeclaration],
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
        [coercedDeclaration],
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
        [coercedDeclaration.dataKey],
    )

    const updateEntity = useCallback(
        ({ type, id }, attributes) => {
            return dispatch(nionActions.updateEntity({ type, id }, attributes))
        },
        [coercedDeclaration.dataKey],
    )

    const ref = useMemo(
        () => (nion.obj ? { id: nion.obj.id, type: nion.obj.type } : null),
        [nion.obj],
    )

    const deleteResource = useCallback(
        (props, options) => deleteDispatchFn(ref, props, options),
        [ref, deleteDispatchFn],
    )

    useEffect(
        () => {
            if (coercedDeclaration.fetchOnMount) {
                getResources()
            }
        },
        [coercedDeclaration.fetchOnMount, getResources],
    )

    const actions = useMemo(
        () => ({
            get: getResources,
            post: postResource,
            patch: patchResource,
            delete: deleteResource,
            updateRef,
            updateEntity,
        }),
        [
            getResources,
            postResource,
            patchResource,
            deleteResource,
            updateRef,
            updateEntity,
        ],
    )

    const initializeDataKey = useCallback(
        (dataKey, ref) =>
            dispatch({
                type: INITIALIZE_DATAKEY,
                payload: { ref },
                meta: { dataKey },
            }),
        [],
    )
    // pull existing data from store by ref if you need to
    useEffect(
        () => {
            if (coercedDeclaration.initialRef && !nion.obj) {
                initializeDataKey(
                    coercedDeclaration.dataKey,
                    coercedDeclaration.initialRef,
                )
            }
        },
        [
            coercedDeclaration.dataKey,
            coercedDeclaration.initialRef,
            initializeDataKey,
            ...deps
        ],
    )

    return [nion.obj, actions, nion.request, nion.extra]
}

export default useNion
