import { expectType, expectError } from 'tsd'
import nion, { NionDecoratorProps, NionDecoratorDeclaration } from '.'
import * as React from 'react'
/* eslint-disable */
{
    interface Props {
        declaration: NionDecoratorDeclaration
        a: string
    }

    class WrappedComponent extends React.Component<Props & NionDecoratorProps> {
        render() {
            return <div />
        }
    }

    const MyComponent = nion<Props>(p => {
        expectType<string>(p.a)
        return p.declaration
    })(WrappedComponent)

    expectType<
        React.ComponentClass<
            Pick<Props & NionDecoratorProps, 'declaration' | 'a'> & Props,
            any
        >
    >(MyComponent)
}

expectError(nion({ endPoint: '' }))
