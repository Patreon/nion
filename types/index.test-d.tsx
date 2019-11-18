import { expectType, expectError } from 'tsd'
import nion, {
    HOCProps,
    HOCDeclaration,
    InferableComponentEnhancerWithProps,
} from '.'
import * as React from 'react'
/* eslint-disable */
{
    interface Props {
        declaration: HOCDeclaration<any>
        a: string
    }

    class WrappedComponent extends React.Component<Props & HOCProps> {
        render() {
            return <div />
        }
    }

    const MyComponent = nion<Props>(p => {
        expectType<string>(p.a)
        return p.declaration as any
    })(WrappedComponent)

    expectType<
        React.ComponentClass<
            Pick<Props & HOCProps, 'declaration' | 'a'> & Props,
            any
        >
    >(MyComponent)
}

expectError(nion({ endPoint: '' }))

expectError(nion(undefined))

expectType<InferableComponentEnhancerWithProps<any, HOCProps>>(
    nion('currentUser'),
)
