import * as React from 'react';
import { OutputSelector } from 'reselect';

export interface NionState {
    nion: {
        requests: { [dataKey: string]: any };
        entities: { [dataKey: string]: any };
        references: { [dataKey: string]: any };
    };
}

export interface NionRequest {
    errors?: Error[];
    fetchedAt?: Date;
    isError?: boolean;
    isLoaded?: boolean;
    isLoading: boolean;
    isProcessing: boolean;
    name?: string;
    pending: boolean;
    status?: 'error' | 'pending' | 'success';
    statusCode?: number;
}

export interface NionRef {
    id: string | number;
    type: string;
}

export interface NionActions<T> {
    get(params: any, actionOptions?: { append?: boolean }): Promise<T>;
    delete(params: any): Promise<T>;
    patch(body?: any, params?: any): Promise<T>;
    post(body?: any, params?: any): Promise<T>;
    updateEntity(ref: NionRef, attributes: any): Promise<T>;
}

export interface NionRefHolder {
    _ref: { data: NionRef | NionRef[] };
}

export interface NionValue<T> extends NionRefHolder {
    data: T | null;
    request: NionRequest;
    actions: NionActions<T>;
}

export function exists<T>(value?: NionValue<T> | null): value is NionValue<T>;

export function selectData<T>(key: string, defaultValue?: any): OutputSelector<NionState, T, any>;
export function selectRequest(key: string): OutputSelector<NionState, NionRequest, any>;
export function selectResourcesForKeys<T extends string>(keys: T[], returnAllObjects?: boolean): OutputSelector<NionState, Record<T, NionValue<any>>, any>;
export function selectObjectWithRequest<T>(dataKey: string): OutputSelector<NionState, T, any>;

export function makeRef(ref: NionRefHolder, options?: { isCollection?: boolean }): { entities: NionRef[], isCollection: boolean, meta: any, links: any };

export function configureNion(options: any): {reducer: any};
export function bootstrapNion(store: NionState, bootstrapObj: any, apiType?: string): void;
export function initializeNionDevTool(store: NionState): void;
export function titleFormatter(action: symbol, time: any, took: number): string;

export const actions: NionActions<any>;

export interface CommonDeclarationValues {
    endpoint: string;
    initialRef?: NionRef;
    extensions?: any;
    apiType?: string;
    requestParams?: any;
}

export interface NionHookDeclaration extends CommonDeclarationValues {
    dataKey: string;
    fetchOnMount?: boolean;
}

export function useNion<T>(declaration: string | NionHookDeclaration): [T | null, NionActions<T>, NionRequest];

export interface NionDecoratorDeclaration extends CommonDeclarationValues {
    dataKey?: string;
    fetchOnInit?: boolean;
    fetchOnce?: boolean;
}

type NionDeclaration<Props> = NionDecoratorDeclaration | string | ((props: Props) => NionDecoratorDeclaration);

export interface InferableComponentEnhancerWithProps<TInjectedProps, TNeedsProps> {
    <P extends TInjectedProps>(
        component: React.ComponentType<P>
    ): React.ComponentClass<Omit<P, keyof TInjectedProps> & TNeedsProps>;
}

declare function nion<Props>(...declarations: Array<NionDeclaration<Props>>): InferableComponentEnhancerWithProps<{nion: {[dataKey: string]: NionValue<any>}}, Props>;

export default nion;
