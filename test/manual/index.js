'use strict'

var sharedTests = require('../tests')

var pay

var ua = require('vigour-ua')
var agent = ua(navigator.userAgent)
var isweb = agent.browser

const AMAZON_WEB_API_TESTING = 'https://resources.amazonwebapps.com/v1/latest/Amazon-Web-App-API-tester.min.js'

describe('Pay manual tests', function () {
  it('should require', function () {
    if (isweb) {
      console.log('web > emulate amazon')
      pay = window.vigour_pay = require('../../lib/amazon')
      fixAmazonTesting(pay.script.element)
    } else {
      console.error('not web native lol')
      pay = window.vigour_pay = require('../../lib')
    }
    expect(pay).to.be.ok
  })

  it('should require bridged module', function () {
    pay = window.vigour_pay = require('../../lib/bridged')
    expect(pay).to.be.ok
  })

  it('should be able to set config', function () {
    // pay.set({
    //   config: config.serialize()
    // })

    // pay.store.emit('value')

    expect(pay).to.have.property('products')
    expect(pay.products).to.have.property('single')
    expect(pay.products).to.have.property('monthly')
    expect(pay.products).to.have.property('yearly')
  })

  sharedTests()
})

function fixAmazonTesting (scriptElement) {
  console.log('fixAmazonTesting')
}
