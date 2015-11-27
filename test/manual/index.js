'use strict'

var sharedTests = require('../tests')
var Config = require('vigour-config')
var testConfig = require('../config')
var config = new Config(testConfig)

var pay

var ISAMAZON = /amazon-fireos|AmazonWebAppPlatform|; AFT/
var isamazon = ISAMAZON.test(navigator.userAgent)

require('./mockNativeMethods')

describe('Pay manual tests', function () {
  it('should require', function () {
    pay = window.vigour_pay = require('../../lib')
    expect(pay).to.be.ok
    if (isamazon) {
      fixAmazonTesting(pay.script.element)
    }
  })

  it('should require bridged module', function () {
    pay = window.vigour_pay = require('../../lib/bridged')
    expect(pay).to.be.ok
  })

  it('should be able to set config', function () {
    pay.set({
      config: config.serialize()
    })
    
    pay.store.emit('value')

    expect(pay).to.have.property('products')
    expect(pay.products).to.have.property('single')
    expect(pay.products).to.have.property('monthly')
    expect(pay.products).to.have.property('yearly')
  })

  sharedTests()
})

function fixAmazonTesting (scriptElement) {

}