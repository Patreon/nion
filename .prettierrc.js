const { safeLoad } = require('js-yaml')
const { readFileSync } = require('fs')
const { resolve } = require('path')

let config

try {
    config = safeLoad(readFileSync(resolve(__dirname, '.eslintrc.yml'))).rules[
        'prettier/prettier'
    ][1]
} catch (e) {
    console.log(e)
}

module.exports = config
