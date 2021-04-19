import { useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useMappedState } from 'redux-react-hook'
// import { useDispatch, useSelector } from 'react-redux' // TODO: Use hooks from React Redux 7.x instead

import { getUrl } from '../utilities/get-url'
import { selectObjectWithRequest } from '../selectors'
import nionActions from '../actions'
import { INITIALIZE_DATAKEY, UPDATE_REF } from '../actions/types'
import { makeRef } from '../transforms'

import { areMergedPropsEqual } from '../decorator/should-rerender'

import { isDevtoolEnabled } from '../devtool'
import { prepareStackTrace, withStats } from '../devtool/hooks'

export const ERROR_INVALID_NION_ACTION = 'Invalid Nion action'

const EMPTY_DEPS = []

function coerceDeclaration(declaration) {
    return typeof declaration === 'string'
        ? { dataKey: declaration }
        : declaration
}

function getOptions(declaration, params, actionOptions, body) {
    const options = {
        declaration,
        endpoint: getUrl(declaration, params),
    }

    if (actionOptions) {
        options.meta = {
            append: actionOptions?.append,
            appendKey: actionOptions?.appendKey,
        }
    }

    if (body) {
        options.body = body
    }

    return options
}

function makeResCallback(method, decl, dispatch) {
    if (typeof nionActions[method] !== 'function') {
        throw new Error(ERROR_INVALID_NION_ACTION)
    }

    if (method === 'get') {
        return (params, actionOptions) => {
            const opt = getOptions(decl, params, actionOptions)

            return nionActions[method](opt.declaration.dataKey, opt)(dispatch)
        }
    }

    return (body, params, actionOptions) => {
        const opt = getOptions(decl, params, actionOptions, body)

        return nionActions[method](opt.declaration.dataKey, opt)(dispatch)
    }
}

function useNion(declaration, deps = EMPTY_DEPS) {
    const dispatch = useDispatch()

    const [decl, dataKey, fetchOnMount, initialRef] = useMemo(() => {
        const coerced = coerceDeclaration(declaration)

        return [
            coerced,
            coerced?.dataKey,
            coerced?.fetchOnMount,
            coerced?.initialRef,
        ]
    }, deps) // eslint-disable-line react-hooks/exhaustive-deps

    const mapStateToProps = useCallback(
        state => ({
            nion: selectObjectWithRequest(dataKey)(state),
        }),
        [dataKey],
    )

    const state = useMappedState(mapStateToProps, areMergedPropsEqual)
    // const state = useSelector(mapStateToProps, areMergedPropsEqual)

    const { extra, obj, objExists, request } = useMemo(() => {
        const nionObj = state?.nion?.obj

        return {
            extra: state?.nion?.extra,
            obj: nionObj,
            objExists: Boolean(nionObj),
            request: state?.nion?.request,
        }
    }, [state])

    const { deleteRes, getRes, patchRes, postRes, putRes } = useMemo(
        () => ({
            deleteRes: (params, actionOptions) => {
                if (!decl.objType || !decl.objId) return

                const opt = getOptions(decl, params, actionOptions)

                // TODO: Refactor ref to delete to not be mutative.
                // https://github.com/Patreon/nion/pull/67
                opt.refToDelete = actionOptions.refToDelete
                    ? actionOptions.refToDelete
                    : { id: decl.objId, type: decl.objType }

                return nionActions.delete(opt.declaration.dataKey, opt)(
                    dispatch,
                )
            },
            getRes: makeResCallback('get', decl, dispatch),
            patchRes: makeResCallback('patch', decl, dispatch),
            postRes: makeResCallback('post', decl, dispatch),
            putRes: makeResCallback('put', decl, dispatch),
        }),
        [decl, dispatch],
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

    const props = [obj, actions, request, extra]

    if (isDevtoolEnabled()) {
        let trace = new Error()

        let calledBy, pst

        if (typeof Error.prepareStackTrace === 'function') {
            pst = Error.prepareStackTrace
        }

        Error.prepareStackTrace = prepareStackTrace
        Error.captureStackTrace(trace)

        calledBy = trace.stack?.component

        Error.prepareStackTrace = pst

        return withStats(calledBy, decl, declaration, props)
    }

    return props
}

export default useNion
