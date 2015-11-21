'use strict'

var Plugin = require('vigour-wrapper/lib/bridge/plugin')

var ua = require('vigour-ua')
var agent = ua(navigator.userAgent)
var store = agent.os === 'Android'
  ? 'android'
  : 'iOS'

var shared = require('./shared')

module.exports = new Plugin({
  store: store,
  inject: shared,
  define: {
    buy (label, callback) {
      var pay = this
      console.log('--- buy!', label)
      var product = pay.products[label]
      var productId = product.val
      if (productId) {
        pay.send('buy', label, (err, response) => {
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
    verifyProducts (callback) {
      console.log('---- verifyProducts!')
      var pay = this
      var products = pay.products
      var map = {}

      var block
      products.each((product, key) => {
        var val = product.val
        if (!val) {
          return block = true
        }
        map[val] = key
      })
      if (block) {
        return
      }

      pay.send('getProducts', (err, storeProducts) => {
        if (!err) {
          console.log('gotStoreProducts', storeProducts)
          for (let storeId in storeProducts) {
            let label = map[storeId]
            let payProduct = products[label]
            if (payProduct) {
              payProduct.set(storeProducts[storeId])
              payProduct._verified = true
            } else {
              console.warn('unconfigured product!')
            }
          }
          let unverified = ''
          products.each((product, label) => {
            if (!product._verified) {
              unverified += label + ', '
            }
          })
          if (unverified) {
            callback(new Error('Pay: unverified products: ' + unverified.slice(0, -2)))
          } else {
            callback(null, storeProducts)
          }
        }
      })
    }
  }
}).Constructor
