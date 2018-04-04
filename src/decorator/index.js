import { connect } from 'react-redux'
import difference from 'lodash.difference'

import { areMergedPropsEqual } from './should-rerender'
import processDeclarations from '../declarations/process-declarations'

import WithNion from '../components/WithNion'

// nion decorator function for wrapping connected components
const withNion = (declarations = {}, ...rest) => WrappedComponent => {
    const {
        makeMapStateToProps,
        mapDispatchToProps,
        mergeProps,
    } = processDeclarations(declarations, ...rest)

    const connectedComponent = connect(
        makeMapStateToProps,
        mapDispatchToProps,
        mergeProps,
        {
            areMergedPropsEqual,
        },
    )(WithNion(WrappedComponent))
    // Take all static properties on the inner Wrapped component and put them on our now-connected
    // component. // This makes nion transparent and safe to add as a decorator; it does not occlude
    // the shape of the inner component.
    difference(
        Object.keys(WrappedComponent),
        Object.keys(connectedComponent),
    ).map(key => {
        connectedComponent[key] = WrappedComponent[key]
    })
    return connectedComponent
}

export default withNion
