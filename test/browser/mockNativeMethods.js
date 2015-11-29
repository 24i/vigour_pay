'use strict'

var nativeMethods = {
  getProducts (opts, cb) {
    console.log('ha fake getProducts!')
    // get those products available to this device
    // nice to have:
    // - establish if store account owns products
    //  - get receipts
    var products = {
      testRegion_single_test: {
        price: 0.99
      },
      testRegion_monthly_test: {
        price: 4.99
      },
      testRegion_yearly_test: {
        price: 14.99
      }
    }
    var err = null
    setTimeout(() => {
      cb(err, products)
    })
  },
  buy (productId, cb) {
    console.log('ha fake buy!')
    // buy dat product
    setTimeout(() => {
      // receipt should include everything needed
      // to validate a purchase with the store
      // by a third party (app UMS / MTV backend)
      // (thats not already known in JS land)

      // var receipt = {
      // 	code: 'speshash',
      // 	time: 123123
      // }

      var receipt = 'hashtovalidate'

      var err = null

      cb(err, receipt)
    })
  }
}

var bridge = require('vigour-wrapper/lib/bridge')
bridge.define({
  send (pluginId, fnName, opts, cb) {
    nativeMethods[fnName](opts, cb, bridge)
  }
})
