'use strict'

var Config = require('vigour-js/lib/config')

module.exports = {
  key: 'Pay',
  products: {},
  on: {
    new () {
      console.log('new Pay module!')
      var pay = this
      var store = pay.store.val
      console.log('store:', store)
      var config = new Config()
      var payConfig = config.pay
      if (payConfig) {
        console.log('detected pay config', config.pay.plain())
        let setProducts = {}
        let storeConfig = payConfig[store]
        storeConfig.products.each((val, key) => {
          setProducts[key] = val.plain()
        })
        pay.products.set(setProducts)
      }
      // pay.verifyProducts()
    }
  }
}
