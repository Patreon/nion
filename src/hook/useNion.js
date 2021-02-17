import { useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useMappedState } from 'redux-react-hook'
// import { useDispatch, useSelector } from 'react-redux' // TODO: Use hooks from React Redux 7.x instead
import get from 'lodash/get'

import { getUrl } from '../utilities/get-url'
import { selectResourcesForKeys } from '../selectors'
import nionActions from '../actions'
import { INITIALIZE_DATAKEY, UPDATE_REF } from '../actions/types'
import { makeRef } from '../transforms'

import { areMergedPropsEqual } from '../decorator/should-rerender'

import { withDebug } from './useNion.util'

export const ERROR_INVALID_NION_ACTION = 'Invalid Nion action'

function coerceDeclaration(declaration) {
    return typeof declaration === 'string'
        ? { dataKey: declaration }
        : declaration
}

function getOptions(decl, params, actionOptions, body) {
    const declaration = coerceDeclaration(decl)

    const o = {
        declaration,
        endpoint: getUrl(declaration, params),
    }

    if (actionOptions) {
        o.meta = {
            append: get(actionOptions, 'append'),
            appendKey: get(actionOptions, 'appendKey'),
        }
    }

    if (body) {
        o.body = body
    }

    return o
}

function makeResCallback(method, decl, dispatch) {
    if (typeof nionActions[method] !== 'function') {
        throw new Error(ERROR_INVALID_NION_ACTION)
    }

    if (method === 'get') {
        return (params, actionOptions) => {
            const o = getOptions(decl, params, actionOptions)

            return nionActions[method](o.declaration.dataKey, o)(dispatch)
        }
    }

    return (body, params, actionOptions) => {
        const o = getOptions(decl, params, actionOptions, body)

        return nionActions[method](o.declaration.dataKey, o)(dispatch)
    }
}

function useNion(decl) {
    const dispatch = useDispatch()

    const { dataKey, fetchOnMount, initialRef } = useMemo(() => {
        if (typeof decl === 'string') return { dataKey: decl }

        return {
            dataKey: get(decl, 'dataKey'),
            fetchOnMount: get(decl, 'fetchOnMount'),
            initialRef: get(decl, 'initialRef'),
        }
    }, [decl])

    const mapStateToProps = useCallback(
        state => ({
            nion: selectResourcesForKeys([dataKey])(state)[dataKey],
        }),
        [dataKey],
    )

    const state = useMappedState(mapStateToProps, areMergedPropsEqual)
    // const state = useSelector(mapStateToProps, areMergedPropsEqual)

    const { extra, obj, objExists, objId, objType, request } = useMemo(() => {
        const nionObj = get(state, 'nion.obj')

        return {
            extra: get(state, 'nion.extra'),
            obj: nionObj,
            objExists: Boolean(nionObj),
            objId: get(nionObj, 'id'),
            objType: get(nionObj, 'type'),
            request: get(state, 'nion.request'),
        }
    }, [state])

    const { getRes, patchRes, postRes, putRes } = useMemo(
        () => ({
            getRes: makeResCallback('get', decl, dispatch),
            patchRes: makeResCallback('patch', decl, dispatch),
            postRes: makeResCallback('post', decl, dispatch),
            putRes: makeResCallback('put', decl, dispatch),
        }),
        [decl, dispatch],
    )

    const deleteRes = useCallback(
        (params, actionOptions) => {
            if (!objId || !objType) return

            const o = getOptions(decl, params, actionOptions)

            // TODO: Refactor ref to delete to not be mutative.
            // https://github.com/Patreon/nion/pull/67
            o.refToDelete = actionOptions.refToDelete
                ? actionOptions.refToDelete
                : { id: objId, type: objType }

            return nionActions.delete(o.declaration.dataKey, o)(dispatch)
        },
        [decl, dispatch, objId, objType],
    )

    const updateEntity = useCallback(
        ({ type, id }, attributes) => {
            dispatch(nionActions.updateEntity({ type, id }, attributes))
        },
        [dispatch],
    )

    const updateRef = useCallback(
        value => {
            dispatch({
                type: UPDATE_REF,
                payload: {
                    ref: makeRef(value),
                },
                meta: {
                    dataKey,
                },
            })
        },
        [dataKey, dispatch],
    )

    const actions = useMemo(
        () => ({
            delete: deleteRes,
            get: getRes,
            patch: patchRes,
            post: postRes,
            put: putRes,
            updateEntity,
            updateRef,
        }),
        [deleteRes, getRes, patchRes, postRes, putRes, updateEntity, updateRef],
    )

    useEffect(() => {
        if (objExists) return

        dispatch({
            type: INITIALIZE_DATAKEY,
            payload: { ref: initialRef },
            meta: { dataKey },
        })
    }, [dataKey, dispatch, initialRef, objExists])

    useEffect(() => {
        if (fetchOnMount) getRes()
    }, [fetchOnMount, getRes])

    const props = useMemo(() => [obj, actions, request, extra], [
        obj,
        actions,
        request,
        extra,
    ])

    return withDebug(props, dataKey, decl, dispatch)
    // return props
}

export default useNion
