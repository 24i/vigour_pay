'use strict'

var Observable = require('vigour-js/lib/observable')

var shared = require('./shared')

module.exports = new Observable({
  ready: false,
  store: 'amazon',
  inject: shared,
  define: {
    buy (label, callback) {
      console.log('--- buy!', label)
      // buy the product from amazon
      // get err and response
      // fake:
      var err = null
      var response = {
        receipt: 'FAKE_RECEIPT',
        status: 'success!'
      }
      callback(err, response)
    },
    verifyProducts (callback) {
      console.log('---- verifyProducts!')
      var pay = this

      // get products from amazon SDK

      // then verify the configured products:
      var products = pay.products
      products.each((val, key) => {
        console.log('verify', key, val.plain())
      })
    }
  }
}).Constructor
