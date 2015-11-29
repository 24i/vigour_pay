'use strict'
var tests = require('../tests')
var nativeInject = require('../../lib/platform/native')

describe('Pay automated tests', function () {
  // describe('Mock Plugin Tests', function () {
  //   tests(require('./mock'))
  // })

  describe('Mock Bridge Tests', function () {
    require('./mockNativeMethods')
    nativeInject.store = 'testStore'
    nativeInject.region = 'testRegion'
    tests(nativeInject)
  })
})
