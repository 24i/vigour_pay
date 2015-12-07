'use strict'

var tests = require('../tests')

var ua = require('vigour-ua')
var agent = typeof navigator !== 'undefined' && ua(navigator.userAgent)
var inject = agent && agent.browser
  ? require('../../lib/platform/amazon')
  : false

describe('Pay manual tests', function () {
  this.bail(true)
  this.timeout(25000)
  tests(inject)
})
