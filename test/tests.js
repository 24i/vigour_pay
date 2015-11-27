'use strict'

var pay

module.exports = function sharedTests () {
  describe('methods and properties shining', function () {
    it('should be verifying products', function (done) {
      pay = window.vigour_pay
      console.log('products', pay.products.serialize())
      setTimeout(() => {
        console.log('products after timeout', pay.products.serialize())
        pay.products.each(function (product) {
          expect(product._verified).to.be.true
          expect(product).to.have.property('price')
        })
        done()
      }, 250)
    })

    it('should buy products', function (done) {
      var total = 0
      var bought = 0
      var store = pay.store.val

      pay.products.each(function (product, label) {
        total++
        pay.buy(label, function (err, receipt) {
          bought++
          expect(product).to.have.property('owned')
          if(store === 'testStore') {
          	expect(product.owned.val)
          		.to.equal('hashtovalidate')
          }
          if (bought === total) {
          	done()
          }
        })
      })
    })
  })
}
