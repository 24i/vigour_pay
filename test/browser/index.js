'use strict'
var tests = require('../tests')

describe('Pay automated tests', function () {
  this.bail(true)

  describe('Mock Bridge Tests', function () {
    var nativePlatform = require('../../lib/platform/native')
    nativePlatform.store = 'testStore'
    nativePlatform.region = 'testRegion'
    var mockBridge = require('./mockBridge')
    tests(nativePlatform, mockBridge)
  })

  describe('Mock Platform tests', function () {
    tests(null, 'mock')
  })
})
