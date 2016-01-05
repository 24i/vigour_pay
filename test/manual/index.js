'use strict'

var tests = require('../tests')
var env = require('vigour-env')

var inject
if (!env.isNative.val) {
  console.log('inject amazon platform!')
  inject = require('../../lib/platform/amazon')
}

describe('Pay manual tests', function () {
  this.bail(true)
  this.timeout(60000)
  tests(inject)
})
