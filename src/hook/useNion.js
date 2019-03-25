import { useEffect, useCallback, useMemo } from 'react'
import get from 'lodash.get'
import omit from 'lodash.omit'

import { selectResourcesForKeys } from '../selectors'
import nionActions from '../actions'
import ApiManager from '../api'
import { INITIALIZE_DATAKEY } from '../actions/types'
import { useDispatch, useMappedState } from 'redux-react-hook'

function useNion(declaration, deps = []) {
    const dispatch = useDispatch()

    const initializeDataKey = useCallback(
        (dataKey, ref) =>
            dispatch({
                type: INITIALIZE_DATAKEY,
                payload: { ref },
                meta: { dataKey },
            }),
        [dispatch],
    )

    // convert `useNion('currentUser') => useNion({dataKey: 'currentUser'})`
    const coercedDeclaration = useMemo(
        () => {
            return typeof declaration === 'string'
                ? { dataKey: declaration }
                : declaration
        },
        [declaration],
    )

    // pull existing data from store by ref if you need to
    useEffect(
        () => {
            if (coercedDeclaration.initialRef) {
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
        ],
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

    const deleteResource = useCallback(
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

    useEffect(
        () => {
            if (coercedDeclaration.fetchOnMount) {
                // fetch on init will go here
            }
        },
        [coercedDeclaration.fetchOnMount],
    )

    const actions = useMemo(
        () => ({
            get: getResources,
            post: postResource,
            patch: patchResource,
            delete: deleteResource,
        }),
        [getResources, postResource, patchResource, deleteResource],
    )

    return [nion.obj, actions, nion.request, nion.extra]
}

export default useNion
