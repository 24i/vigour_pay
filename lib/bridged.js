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
        pay.send('buy', productId, (err, response) => {
          // assuming stuff here about response
          if (!err && response.receipt) {
            product.set({
              owned: {
                val: true,
                receipt: response.receipt
              }
            })
          }
          callback(err, response)
        })
      } else {
        throw new Error('Pay: product ' + productId + ' not found!')
      }
    },
    getProducts (callback) {
      pay.send('getProducts', {}, callback)
    }
  }
})
