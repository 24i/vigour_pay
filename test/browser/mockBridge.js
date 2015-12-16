'use strict'
var bridge = require('vigour-wrapper/lib/bridge')
var testData = require('../testData.json')

bridge.lable = 'mockBridge'
bridge.mock = {
  methods: {
    getProducts (opts, cb) {
      // get those products available to this device
      // nice to have:
      // - establish if store account owns products
      //  - get receipts
      setTimeout(() => {
        cb(null, testData.products)
      })
    },
    buy (productId, cb) {
      // buy dat product
      setTimeout(() => {
        // receipt should include everything needed
        // to validate a purchase with the store
        // by a third party (app UMS / MTV backend)
        // (thats not already known in JS land)

        // err, receipt
        cb(null, testData.receipt)
      })
    }
  }
}

delete bridge.send

bridge.define({
  send: function (pluginId, fnName, opts, cb) {
    bridge.mock.methods[fnName](opts, cb, bridge)
  }
})

module.exports = bridge
