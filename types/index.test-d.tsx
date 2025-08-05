import { expectType, expectError } from 'tsd';
import nion, { HOCProps, InferableComponentEnhancerWithProps, useNion, NionValue } from '.';
import React, { FC, ComponentType } from 'react';
/* eslint-disable */
{
  const nionDeclaration = { currentUser: {} };

  interface Props {
    a: string;
  }

  const WrappedComponent: FC<Props & HOCProps<[typeof nionDeclaration]>> = () => {
    return <div />;
  };

  const MyComponent = nion((p: Props) => {
    expectType<string>(p.a);
    return nionDeclaration;
  })(WrappedComponent);

  expectType<FC<{ a: string } & { nion: { currentUser: NionValue<any> } }>>(WrappedComponent);
  expectType<ComponentType<{ a: string }>>(MyComponent);
}

expectError(useNion({}));

expectError(nion());

const currentUserDeclaration = 'currentUser';

expectType<InferableComponentEnhancerWithProps<any, HOCProps<[typeof currentUserDeclaration]>>>(
  nion(currentUserDeclaration),
);
