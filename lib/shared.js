'use strict'

var Config = require('vigour-js/lib/config')

var Observable = require('vigour-js/lib/observable')
var _parseValue = Observable.prototype.parseValue

var TEMPLATED = /\{(.+?)\}/g

var pkg = require('../package.json')

module.exports = {
  key: pkg.name,
  products: {
    ChildConstructor: new Observable({
      inject: require('vigour-js/lib/methods/lookUp'),
      on: {
        data (data, event) {
          var product = this
          if (product._templated) {
            // can not change product values (can add properties)
            return
          }
          var val = product._input
          if (val instanceof Observable) {
            val = val.val
          }
          if (typeof val === 'string') {
            let templateKey
            while (templateKey = TEMPLATED.exec(val)) {
              if(!product._templated) {
                product._templated = {}
              }
              templateKey = templateKey[1]
              let pay = this.lookUp('Pay')
              let has = pay.get(templateKey, {})
              has.on(product)
              product._templated[templateKey] = has
            }
          }
        }
      },
      define: {
        parseValue: function parseProductValue () {
          var product = this
          var val = product._input
          if (val instanceof Observable) {
            val = val.val
          }
          if (typeof val === 'string') {
            let found
            while(found = TEMPLATED.exec(val)) {
              let templateKey = found[1]
              let templateVal = product._templated[templateKey]
              templateVal = templateVal && templateVal.val
              if (typeof templateVal !== 'string') {
                TEMPLATED.lastIndex = 0
                return false
              }
              let foundAt = found.index
              val = val.slice(0, foundAt) +
                templateVal +
                val.slice(foundAt + found[0].length)
              TEMPLATED.lastIndex = foundAt + templateVal.length
            }
            return val
          } else {
            return _parseValue.apply(this, arguments)
          }
        }
      }
    }).Constructor
  },
  on: {
    new () {
      console.log('new Pay module!')
      var pay = this
      var store = pay.store.val
      console.log('store:', store)
      var config = new Config()
      var payConfig = config.pay
      if (payConfig) {
        console.log('detected pay config', config.pay.plain())
        let setProducts = {}
        let storeConfig = payConfig[store]
        storeConfig.products.each((val, key) => {
          setProducts[key] = val.plain()
        })
        console.log('gonna do dat set', setProducts)
        pay.products.set(setProducts)
        console.log('did dat set?!')
      }
      // pay.verifyProducts()
    }
  },
  define: {
    verifyProducts (callback) {
      console.log('---- verifyProducts!')
      var pay = this
      var products = pay.products
      var map = {}

      var block
      products.each((product, key) => {
        var val = product.val
        if (!val) {
          block = key + ': ' + product._input
          return true
        }
        map[val] = key
      })
      if (block) {
        return callback(new Error('could not parse templated value: ' + block))
      }

      pay.getProducts((err, storeProducts) => {
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
}
