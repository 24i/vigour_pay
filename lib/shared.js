'use strict'

var Product = require('./product')
var plain = require('vigour-js/lib/methods/plain')
module.exports = {
  store: {
    on: {
      value () {
        console.log('-----------> SET STORE!')
        console.log(new Error().stack)
        var pay = this.parent
        var storeName = this.val
        var store = pay[storeName]
        if (store) {
          console.log('-----------> GOT STORE CONFIG!', store.serialize())
          pay.set(store.serialize())
        } else {
          console.error('could not detect config for', storeName)
        }
      }
    }
  },
  products: {
    inject: plain,
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

        console.log('storeProd')

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
      console.log('validateProducts > getProducts')
      pay._platform.emit('getProducts', { products, cb: function (err, storeProducts) {
        if (!err) {
          products.emit('storeProducts', { storeProducts, cb (err) {
            if (!err) {
              console.log('---- ok all good')
              pay.ready.val = true
            }
          }})
        }
      }})
    }
  }
}

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
