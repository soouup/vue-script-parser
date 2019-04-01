const fs = require('fs')
const path = require('path')
const analyzer = require('../lib/index').default

const code = fs.readFileSync(path.join(__dirname, 'toRead.vue'), 'utf-8')
const info = analyzer(code)
