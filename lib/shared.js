'use strict'

var Product = require('./product')
var plain = require('vigour-js/lib/methods/plain')
module.exports = {
  validated: {
    val: false,
    inject: require('vigour-js/lib/observable/is')
  },
  store: {
    on: {
      value () {
        console.log('-----------> [pay] store is set!', this.val)
        var store = this
        var pay = store.parent
        pay._platform.ready.on('data', function onReady () {
          if (this.val === true) {
            // console.error('[PAY] ok platform is ready!!!')
            if (this.parent._isOrientationWeb) {
              pay.ready.val = false
              pay._platform.ready.val = false
            } else {
              pay._platform.ready.off('data', onReady)
              var storeName = store.val
              var storeInfo = pay[storeName]
              if (storeInfo) {
                // console.log('-----------> GOT STORE CONFIG!', storeInfo.serialize())
                pay.set(storeInfo.serialize())
              } else {
                // console.error('could not detect config for', storeName)
              }
            }

          }
        })
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
        console.log('[pay][shared][products] >> on storeProducts > set products!')
        console.log('[pay][shared][products] products', products)

        // console.log('[products on storeProducts] event triggered!')
        var products = this
        var pay = products.parent
        var storeProducts = data.storeProducts
        var cb = data.cb
        var unverified

        products.each(function (product, label) {
          console.log('[pay][shared][products] each product', label)

          // console.log('[products on storeProducts] i have product', label)
          var storeId = product.val
          var storeInfo = storeProducts[storeId] || storeProducts[label]

          if (storeInfo) {
            console.log('[pay][shared][products] got storeInfo! set!', storeInfo)
            product.set(storeInfo)
          } else {
            console.log('[pay][shared][products] ERROR cant find storeInfo! emit error!')
            console.log('[pay][shared][products] ERROR product', product)
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
      // // console.log('---- product added > verifyProducts!')
      var unknown
      products.each(function validateEach (product, label) {
        if (!product.val) {
          unknown = 'failed to get storeId for ' + label + ' with ' + product._val
          return true
        }
      })
      if (unknown) {
        // console.warn(unknown)
        return
      }
      console.log('[pay][shared][validateProducts] >> validateProducts > emit getProducts')
      pay._platform.emit('getProducts', { products, cb: function (err, storeProducts) {
        console.log('[pay][shared][validateProducts] << getProducts callback! storeProducts', storeProducts)

        // console.log('[validateProducts] got storeProducts', err || storeProducts)
        if (!err) {
          // console.log('emit on products')
          console.log('[pay][shared][validateProducts] >> have storeProducts > emit storeProducts on pay.products!')
          products.emit('storeProducts', { storeProducts, cb (err) {
            console.log('[pay][shared][validateProducts] << got pay.store storeProducts callback > if no error > validated!')
            // console.log('[validateProducts] products.emit(storeProducts callback', err)
            if (!err) {
              console.log('[pay][shared][validateProducts]  ---- ok all good', pay.products.serialize())
              // console.log('[validateProducts] ready before set?', pay.ready.val)
              pay.validated.val = true
              // pay.ready.val = true
            } else {
              console.log('[pay][shared][validateProducts]  ---- not all good', err)
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
