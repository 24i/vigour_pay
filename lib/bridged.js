'use strict'
console.log('?')
var Plugin = require('vigour-wrapper/lib/bridge/plugin')

var ua = require('vigour-ua')
var agent = ua(navigator.userAgent)
var store = agent.os === 'iOS'
  ? 'iOS'
  : 'android'

var shared = require('./shared')

module.exports = new Plugin({
  inject: shared,
  store: store,
  define: {
    buy (label, callback) {
      var pay = this
      console.log('--- buy!', label)
      var product = pay.products[label]
      var productId = product.val
      if (productId) {
        pay.send('buy', productId, (err, receipt) => {
          if (!err && receipt) {
            product.set({
              owned: receipt
            })
          }
          callback(err, receipt)
        })
      } else {
        throw new Error('Pay: product ' + productId + ' not found!')
      }
    },
    getProducts (callback) {
      this.send('getProducts', {}, callback)
    }
  }
})
