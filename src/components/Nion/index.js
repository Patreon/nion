import { Component } from 'react'
import PropTypes from 'prop-types'
import get from 'lodash.get'

import withNion from '../../decorator'

@withNion(({ declaration }) => declaration)
class Nion extends Component {
    static propTypes = {
        render: PropTypes.func.isRequired,
        nion: PropTypes.object.isRequired,
        declaration: PropTypes.object.isRequired,
    }

    render() {
        const { nion, render, declaration } = this.props
        const dataKey = get(Object.keys(declaration), '0')
        const nionObject = get(nion, dataKey)
        return render(nionObject)
    }
}

export default Nion
