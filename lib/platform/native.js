'use strict'

var pkg = require('../../package.json')
var bridge = require('vigour-wrapper/lib/bridge/inject')

var ua = require('vigour-ua')
var agent = ua(navigator.userAgent)
var store = agent.os === 'iOS'
  ? 'iOS'
  : 'android'

module.exports = {
  inject: bridge(pkg.name),
  store: store,
  platform: {
    wuxt: true,
    on: {
      getProducts (data) {
        console.error('hehuehue getProducts', data)
      },
      buy (product) {
        console.error('omg buy', product)
      }
    }
  },
  products: {
    on: {
      getProducts: {
        condition (data, next, event) {
          console.log('native getProducts!', data)
          var pay = this.parent
          pay.send('getProducts', void 0, function gotProducts (err, response) {
            console.log('yay getProducts bridge response!', err, response)
            if (!err) {
              console.log('heuheu next', response)
              next(false, response)
            }
          })
        }
      },
      bought: {
        condition (product, next, event) {
          console.error('2 :', arguments)         
          var pay = this.parent
          pay.send('buy', product.val, function (err, receipt) {
            console.log('buy response from native', err, receipt)
            next(err, {product, receipt})
          })
        }
      }
    }
  },
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
}
