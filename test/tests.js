'use strict'

require('gaston-tester')

const AMAZON_WEB_API_TESTING = 'https://resources.amazonwebapps.com/v1/latest/Amazon-Web-App-API-tester.min.js'

module.exports = function payTests (inject, type) {
  var pay

  it('require pay', function () {
    try {
      console.log('craete pay')
      pay = window.PAY = require('../lib')
      // pay = require('../lib')
    } catch (err) {
      console.log(err.stack)
      throw err
    }
  })

  if (inject || type === 'mock') {
    it('create new pay with platform injection', function (done) {
      if (type === 'mock') {
        inject = require('../lib/platform/mock')
        inject._platform.activeMode = true
        inject.store = 'testStore'
        inject.region = 'testRegion'
      }
      console.error('create new pay with inject')
      pay = window.PAY = new pay.Constructor(inject)
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

  it('should throw on errors in pay', function () {
    pay.on('error', function (err) {
      console.error('pay error in tests!', err)
      throw err
    })
  })

  it('should have products', function () {
    expect(pay.products).to.have.property('single')
      .which.has.property('val').which.is.a.string
    expect(pay.products).to.have.property('monthly')
      .which.has.property('val').which.is.a.string
    expect(pay.products).to.have.property('yearly')
      .which.has.property('val').which.is.a.string
  })

  it('should be verifying products', function (done) {
    // console.log('pay.ready.val', pay.ready.val, inject)
    pay.validated.is(true, function (val) {
      // console.log('wat ready')
      pay.products.each(function (product) {
        expect(product).to.have.property('price')
      })
      done()
    })
  })

  it('should buy products', function (done) {
    var total = 0
    var bought = 0
    var buying = document.createElement('div')

    pay.products.each(function (product, label) {
      var buybutton = document.createElement('button')
      var labelText = document.createTextNode(label)
      buybutton.appendChild(labelText)
      buybutton.onclick = function clickBuy () {
        product.owned.val = true
      }
      buying.appendChild(buybutton)
      total++
      product.owned.once('data', function (data) {
        console.log('bought!', product.path)
        expect(this.val).to.be.true
        expect(this.receipt).to.be.ok.and.have.property('val').which.is.ok
        bought++
      })
    })

    expect(total).to.be.ok

    var nextP = document.createElement('p')
    var doneButton = document.createElement('button')
    var labelText = document.createTextNode('bought everything!')
    doneButton.onclick = function clickDone () {
      console.log('total', total)
      console.log('bought', bought)
      expect(total).equals(bought)
      done()
    }
    doneButton.appendChild(labelText)
    nextP.appendChild(doneButton)
    buying.appendChild(nextP)

    document.body.insertBefore(buying, document.body.firstChild)
  })
}

function injectAmazonTestSDK (cb) {
  console.log('inject dat amazon test SDK shizle')
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
