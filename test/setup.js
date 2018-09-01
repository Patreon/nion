import raf from './polyfills' // eslint-disable-line no-unused-vars

const Enzyme = require('enzyme')
const EnzymeAdapter = require('enzyme-adapter-react-16')

// Disable test warnings

// Setup enzyme's react adapter
Enzyme.configure({ adapter: new EnzymeAdapter() })
