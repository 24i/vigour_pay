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
        console.log('[pay] ready?', pay._platform.ready.val)
        var ready = pay._platform.ready
        if (ready.val) {
          onReady()
        } else {
          pay._platform.ready.on('data', onReady)
        }
        function onReady () {
          console.log('[pay] ok ready set')
          if (ready.val === true) {
            console.log('[pay] ok ready true')
            // console.error('[PAY] ok platform is ready!!!')
            if (ready.parent._isOrientationWeb) {
              console.error('[pay] oh no.. orientation is tripping my balls!')
              pay.ready.val = false
              pay._platform.ready.val = false
            } else {
              pay._platform.ready.off('data', onReady)
              var storeName = store.val
              var storeInfo = pay[storeName]
              console.log('[pay] storeName', storeName, 'storeInfo', storeInfo && storeInfo.serialize())
              if (storeInfo) {
                console.log('-----------> [pay] set store config!', storeInfo.serialize())
                pay.set(storeInfo.serialize())
              } else {
                // console.error('could not detect config for', storeName)
              }
            }
          } else {
            console.error('haha no...??')
          }
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
        // console.log('[products on storeProducts] event triggered!')
        var products = this
        var pay = products.parent
        var storeProducts = data.storeProducts
        var cb = data.cb
        var unverified

        products.each(function (product, label) {
          // console.log('[products on storeProducts] i have product', label)
          var storeId = product.val
          var storeInfo = storeProducts[storeId] || storeProducts[label]
          if (storeInfo) {
            // console.log('[products on storeProducts] got storeInfo! set!', storeInfo)
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
      // console.log('validateProducts > pay._platform.emit(getProducts')
      pay._platform.emit('getProducts', { products, cb: function (err, storeProducts) {
        // console.log('[validateProducts] got storeProducts', err || storeProducts)
        if (!err) {
          // console.log('emit on products')
          products.emit('storeProducts', { storeProducts, cb (err) {
            // console.log('[validateProducts] products.emit(storeProducts callback', err)
            if (!err) {
              // console.log('[validateProducts] ---- ok all good', pay.products.serialize())
              // console.log('[validateProducts] ready before set?', pay.ready.val)
              pay.validated.val = true
              // pay.ready.val = true
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
