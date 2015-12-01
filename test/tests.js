'use strict'

module.exports = function payTests (inject) {
  var pay

  it('require pay', function () {
    console.log('requireing')
    try {
      pay = require('../lib')
      // pay = require('../lib')
    } catch (err) {
      console.log(err.stack)
      throw err
    }
    pay = require('../lib')
    console.log('ok required it')
  })

  if (inject) {
    it('create new pay with platform injection', function () {
      pay.inject(inject)
      // pay = window.p = new pay.Constructor(inject)
      console.log('recreated with inject lala')
      pay.on('error', function (err) {
        throw err
      })
      // fake ready from native side
      console.log('urprurp')
      try {
        pay.ready.val = true
      } catch (err) {
        console.log(err.stack)
        throw err
      }
      pay.ready.val = true
      console.log('urprurp')
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
    this.timeout(550)

    setTimeout(function () {
      console.log('products after timeout', pay.products.serialize())
      pay.products.each(function (product) {
        expect(product).to.have.property('price')
      })
      done()
    }, 500)
  })

  it('should buy products', function (done) {
    console.log('--------------- buying products')
    var total = 0
    var bought = 0

    pay.products.each(function (product, label) {
      total++
      product.on('error', function (err) {
        throw err
      })
      product.owned.val = true
      product.owned.once('value', function () {
        expect(this.val).to.be.true
        expect(this.receipt).to.have.property('val')
          .which.is.ok
        if (++bought === total) {
          done()
        }
      })
    })

    expect(total).to.be.ok
  })
}
