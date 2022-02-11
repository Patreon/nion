import nion from '../'
import React from 'react'
import PropTypes from 'prop-types'
import { mount } from 'enzyme'

import { Provider } from 'react-redux'
import configureTestStore from '../../../test/configure-test-store'

describe('nion', () => {
    describe('propTypes validation', () => {
        let OuterComponent
        let originalConsoleError
        let store

        beforeAll(() => {
            originalConsoleError = global.console.error
            // Treat all console.errors as test failures to catch failed propType validation
            global.console.error = (...args) => {
                throw new Error(args[0])
            }
        })

        afterAll(() => {
            global.console.error = originalConsoleError
        })

        beforeEach(() => {
            class WrappedComponent extends React.Component {
                static propTypes = {
                    nion: PropTypes.object.isRequired,
                }

                render() {
                    return null
                }
            }
            OuterComponent = nion()(WrappedComponent)
            store = configureTestStore()
        })

        it('has no propTypes errors', () => {
            mount(
                <Provider store={store}>
                    <OuterComponent />
                </Provider>,
            )
        })
    })
})
