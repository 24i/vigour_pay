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
    ChildConstructor: Product,
    on: {
      property (data) {
        var added = data.added
        if (added) {
          console.log('---- product added > verifyProducts!')
          for (let key of added) {
            if (!this[key].val) {
              console.warn(
                'could not parse templated', key, 'value:', this[key]._input
              )
              return
            }
          }
          this.emit('getProducts')
        }
      },
      getProducts (storeProducts) {
        var pay = this.parent
        if (storeProducts) {
          console.log('--- getProducts fires!', storeProducts)
          this.each(function (product, label) {
            var storeId = product.val
            var storeInfo = storeProducts[storeId]
            if (storeInfo) {
              product.set(storeInfo)
            } else {
              pay.emit('error', {
                message: 'unverified product',
                product: product
              })
            }
          })
        } else {
          pay.emit('error', 'empty getProducts emit')
        }
      }
    }
  },
  inject: [
    config,
    require('./platform')
  ]
})
