'use strict'
var tests = require('../tests')
var nativeInject = require('../../lib/platform/native')

describe('Pay automated tests', function () {
  this.bail(true)

  describe('Mock Bridge Tests', function () {
    require('./mockBridge')
    nativeInject.store = 'testStore'
    nativeInject.region = 'testRegion'
    tests(nativeInject)
  })
})
