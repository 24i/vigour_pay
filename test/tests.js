'use strict'

const AMAZON_WEB_API_TESTING = 'https://resources.amazonwebapps.com/v1/latest/Amazon-Web-App-API-tester.min.js'

module.exports = function payTests (inject) {
  var pay

  it('require pay', function () {
    try {
      pay = require('../lib')
      // pay = require('../lib')
    } catch (err) {
      console.log(err.stack)
      throw err
    }
    window.p = pay = require('../lib')
  })

  if (inject) {
    it('create new pay with platform injection', function (done) {
      pay = new pay.Constructor(inject)
      pay.on('error', function (err) {
        throw err
      })
      if (inject.store === 'testStore') {
        // fake ready from native side
        pay._platform.ready.val = true
        done()
      } else if (inject.store === 'amazon') {
        pay._platform.scriptLoaded.is(true, function () {
          injectAmazonTestSDK(done)
        })
      }
    })
  }

  it('should have products', function () {
    expect(pay.products).to.have.property('single')
      .which.has.property('val').which.is.a.string
    expect(pay.products).to.have.property('monthly')
      .which.has.property('val').which.is.a.string
    expect(pay.products).to.have.property('yearly')
      .which.has.property('val').which.is.a.string
  })

  it('should be verifying products', function (done) {
    console.log('pay.ready.val', pay.ready.val, inject)
    pay.ready.is(true, function (val) {
      console.log('wat ready')
      pay.products.each(function (product) {
        expect(product).to.have.property('price')
      })
      done()
    })
  })

  it('should buy products', function (done) {
    var total = 0
    var bought = 0

    pay.products.each(function (product, label) {
      total++
      try {
        product.owned.once('data', function (data) {
          expect(this.val).to.be.true
          expect(this.receipt).to.be.ok.and.have.property('val').which.is.ok
          if (++bought === total) {
            done()
          }
        })
        product.owned.val = true
      } catch (err) {
        console.log(err.stack)
        throw err
      }
    })

    expect(total).to.be.ok
  })
}

function injectAmazonTestSDK (cb) {
  var script_testing = document.createElement('script')
  script_testing.src = AMAZON_WEB_API_TESTING
  script_testing.id = 'amazon-script-testing'
  script_testing.onload = () => {
    amzn_wa.enableApiTester(amzn_wa_tester)
    if (cb) {
      cb()
    }
  }
  document.getElementsByTagName('head')[0].appendChild(script_testing)
}
