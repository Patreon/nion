import { titleFormatter } from './'

describe('titleFormatter', () => {
    it('should format a regular string', () => {
        expect(titleFormatter({ type: 'yay' }, 0, 500)).toMatchSnapshot()
    })

    it('should format a symbol', () => {
        expect(
            titleFormatter(
                {
                    type: Symbol('nion/NION_API'),
                    meta: { dataKey: 'currentUser' },
                },
                0,
                500,
            ),
        ).toMatchSnapshot()
    })
})
