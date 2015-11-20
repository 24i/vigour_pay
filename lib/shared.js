'use strict'

var Config = require('vigour-js/lib/config')

var Observable = require('vigour-js/lib/observable')
var _parseValue = Observable.prototype.parseValue

var TEMPLATED = /\{(.+?)\}/g

module.exports = {
  key: 'Pay',
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
      this.verifyProducts()
    }
  }
}
