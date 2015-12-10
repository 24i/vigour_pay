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
    var mockPlatform = require('../../lib/platform/mock')
    mockPlatform._platform.activeMode = true
    mockPlatform.store = 'testStore'
    mockPlatform.region = 'testRegion'
    tests(mockPlatform, 'platform')
  })
})
