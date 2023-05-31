import * as React from 'react'
import { OutputSelector } from 'reselect'

export interface NionReduxState {
    nion: {
        requests: { [dataKey: string]: any }
        entities: { [dataKey: string]: any }
        references: { [dataKey: string]: any }
    }
}

export interface NionRequest {
    errors?: Error[]
    fetchedAt?: Date
    isError?: boolean
    isLoaded?: boolean
    isLoading: boolean
    isProcessing: boolean
    name?: string
    pending: boolean
    status?: 'not called' | 'error' | 'pending' | 'success'
    statusCode?: number
}

export interface NionRef {
    id: string | number
    type: string
}

export interface GetActionOptions {
    append?: boolean
    appendKey?: string
}

export interface DeleteActionOptions {
    refToDelete?: NionRef
}

export interface Actions<T> {
    get(params?: any, actionOptions?: GetActionOptions): Promise<T>
    delete(params?: any, actionOptions?: DeleteActionOptions): Promise<T>
    put(params?: any): Promise<T>
    patch(body?: any, params?: any): Promise<T>
    post(body?: any, params?: any): Promise<T>
    updateEntity(ref: NionRef, attributes: any): Promise<T>
}

export interface NionRefHolder {
    _ref: { data: NionRef | NionRef[] }
}

export interface NionValue<T> extends NionRefHolder {
    data: T | null
    request: NionRequest
    actions: Actions<T>
}

export function exists<T>(value?: NionValue<T> | null): value is NionValue<T>

export function selectData<T>(
    key: string,
    defaultValue?: any,
): OutputSelector<NionReduxState, T, any>

export function selectRequest(
    key: string,
): OutputSelector<NionReduxState, NionRequest, any>

export function selectResourcesForKeys<T extends string>(
    keys: T[],
    returnAllObjects?: boolean,
): OutputSelector<NionReduxState, Record<T, NionValue<any>>, any>

export function selectObjectWithRequest<T>(
    dataKey: string,
): OutputSelector<NionReduxState, T, any>

export function makeRef(
    ref: NionRefHolder,
    options?: { isCollection?: boolean },
): { entities: NionRef[]; isCollection: boolean; meta: any; links: any }

export function configureNion(options: any): { reducer: any }

export function bootstrapNion(
    store: NionReduxState,
    bootstrapObj: any,
    apiType?: string,
): void

export function initializeNionDevTool(store: NionReduxState): void

export function titleFormatter(action: symbol, time: any, took: number): string

export const actions: Actions<any>

export interface CommonDeclarationValues {
    endpoint: string
    initialRef?: NionRef
    extensions?: any
    apiType?: string
    requestParams?: any
}

export interface HookDeclaration extends CommonDeclarationValues {
    dataKey: string
    fetchOnMount?: boolean
}

export type NionMeta = Record<'meta' | string, any>

export function useNion<T>(
    declaration: string | HookDeclaration,
    dependencyArray?: any[],
): [T | null, Actions<T>, NionRequest, NionMeta]

export interface ExpandedHOCDeclaration extends CommonDeclarationValues {
    dataKey?: string
    fetchOnInit?: boolean
    fetchOnce?: boolean
}

export type DataKey = string

export type HOCDeclaration<Props> =
    | ExpandedHOCDeclaration
    | DataKey
    | ((props: Props) => ExpandedHOCDeclaration)

export interface InferableComponentEnhancerWithProps<TNeedsProps, TInferProps> {
    <P extends TInferProps>(
        component: React.ComponentType<P>,
    ): React.ComponentClass<Omit<P, keyof TInferProps> & TNeedsProps>
}

export type HOCProps = {
    nion: { [dataKey: string]: NionValue<any> }
}

declare function nion<Props>(
    ...declarations: [HOCDeclaration<Props>, ...Array<HOCDeclaration<Props>>]
): InferableComponentEnhancerWithProps<Props, HOCProps>
export default nion

export type ApiOptions = {
    isClient: boolean
}