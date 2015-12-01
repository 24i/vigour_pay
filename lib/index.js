'use strict'

var Plugin = require('vigour-wrapper/lib/plugin')

var pkg = require('../package.json')
var config = pkg.vigour.pay

var Config = require('vigour-config')
var appConfig = new Config()

if (appConfig.pay) {
  let merge = require('vigour-js/lib/util/merge')
  merge(config, appConfig.pay.plain())
}

var Product = require('./product')

module.exports = new Plugin({
  store: {
    on: {
      value () {
        console.log('store value set, read config!')
        var pay = this.parent
        var storeName = this.val
        var store = pay[storeName]
        if (store) {
          pay.set(store.serialize())
        } else {
          console.warn('could not detect config for', storeName)
        }
      }
    }
  },
  products: {
    on: {
      property (data) {
        var added = data.added
        if (added) {
          this.parent.validateProducts()
        }
      },
      storeProducts (data) {
        var products = this
        var pay = products.parent
        var storeProducts = data.storeProducts
        var cb = data.cb
        var unverified

        console.log('waow got storeProducts!', storeProducts)

        products.each(function (product, label) {
          var storeId = product.val
          var storeInfo = storeProducts[storeId]
          if (storeInfo) {
            product.set(storeInfo)
          } else {
            unverified = stack(unverified, product)
            pay.emit('error', {
              message: 'unverified product',
              product: product
            })
          }
        })

        if (cb) {
          cb(unverified, storeProducts)
        }
      }
    },
    ChildConstructor: Product
  },

  define: {
    validateProducts () {
      var pay = this
      var products = pay.products
      // console.log('---- product added > verifyProducts!')
      var unknown
      products.each(function validateEach (product, label) {
        if (!product.val) {
          unknown = 'failed to get storeId for ' + label + ' with ' + product._val
          return true
        }
      })
      if (unknown) {
        console.warn(unknown)
        return
      }
      pay.platform.emit('getProducts', function (err, storeProducts) {
        if (!err) {
          products.emit('storeProducts', { storeProducts, cb (err) {
            if (!err) {
              console.log('---- ok all good')
              pay.ready.val = true
            }
          }})
        }
      })
    }
  },
  inject: [
    config,
    require('./platform')
  ]
})

function stack (have, add) {
  if (have) {
    if (have instanceof Array) {
      have.push(add)
    } else {
      have = [ have, add ]
    }
  } else {
    have = add
  }
  return have
}
