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
  ready: {
    on: {
      data: {
        condition (data, next, event) {
          console.log('raedy condition hurps!', data)
          next()
        }
      }
    }
  },
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
          var products = this
          console.log('---- product added > verifyProducts!')
          for (let key of added) {
            if (!products[key].val) {
              console.warn(
                'could not parse templated', key, 'value:', products[key]._input
              )
              return
            }
          }
          var pay = products.parent
          console.log('-------------??? go')
          pay.platform.emit('getProducts', function (storeProducts) {
            console.log('------ got  storeProducts', storeProducts)

            if (storeProducts) {
              console.log('--- got storeProducts fires!', storeProducts)
              let unverified
              products.each(function (product, label) {
                var storeId = product.val
                var storeInfo = storeProducts[storeId]
                if (storeInfo) {
                  product.set(storeInfo)
                } else {
                  unverified = true
                  pay.emit('error', {
                    message: 'unverified product',
                    product: product
                  })
                }
              })
              if (!unverified) {
                pay.ready.val = true
              } else {
                console.warn('')
              }
            } else {
              pay.emit('error', 'failed to get storeProducts')
            }
          })
        }
      }
    },
    ChildConstructor: Product
  },
  inject: [
    config,
    require('./platform')
  ]
})
