'use strict'

var Config = require('vigour-config')
var config = new Config()
console.log('got config', config)
var payConfig = config.pay

var Observable = require('vigour-js/lib/observable')
var _parseValue = Observable.prototype.parseValue

var TEMPLATED = /\{(.+?)\}/g
var VIGOURNAME = /vigour-(.+)|@vigour\/(.+)/

var Product = new Observable({
  inject: require('vigour-js/lib/methods/lookUp'),
  on: {
    data (data, event) {
      var product = this
      if (product._templated) {
        // can not change templated product values
        return
      }
      var val = product._input
      if (val instanceof Observable) {
        val = val.val
      }
      if (typeof val === 'string') {
        let templateKey
        while (templateKey = TEMPLATED.exec(val)) {
          if (!product._templated) {
            product._templated = {}
          }
          templateKey = templateKey[1]
          let pay = this.parent.parent
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
        while (found = TEMPLATED.exec(val)) {
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

module.exports = {
  key: getName(),
  config: payConfig && payConfig.serialize(),
  store: {
    on: {
      value () {
        console.log('store value set, read config!')
        var pay = this.parent
        var payConfig = pay.config
        if (payConfig) {
          let store = this.val
          console.log('detected pay config', payConfig)
          let storeConfig = payConfig[store]
          if (storeConfig) {
            pay.set(storeConfig.serialize())
            pay.verifyProducts()
          } else {
            console.warn('store', store, 'not found in config')
          }
        } else {
          console.warn('no pay config detected')
        }
      }
    }
  },
  products: {
    ChildConstructor: Product
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
        if (callback) {
          callback(
            new Error('could not parse templated value: ' + block)
          )
        }
        return false
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
          err = unverified
            ? Error(
                'Pay: unverified products: ' +
                unverified.slice(0, -2)
              )
            : null
        }

        if (callback) {
          callback(err, storeProducts)
        }
      })
    }
  }
}

function getName () {
  var pkgName = require('../package.json').name
  var vigourName = pkgName && pkgName.match(VIGOURNAME)
  vigourName = vigourName[1]
  if (!vigourName) {
    throw Error('bad package name ' + pkgName)
  }
  return vigourName
}
