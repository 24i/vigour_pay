'use strict'

var Observable = require('vigour-js/lib/observable')
var _parseValue = Observable.prototype.parseValue
var TEMPLATED = /\{(.+?)\}/g

module.exports = new Observable({
  owned: {
    val: false,
    on: {
      data: {
        condition (val, next, event) {
          console.log('[buy] triggered!')
          if (val) {
            console.log('[buy] set to', val)
            let owned = this
            let product = owned.parent
            let pay = product.parent.parent
            let storeId = product.val
            console.log('[buy] storeId', storeId)
            if (storeId) {
              console.log('[buy] platform emit buy!', storeId)
              pay._platform.emit('buy', {
                id: storeId,
                cb: function bought (err, receipt) {
                  console.log('[buy] platform buy callback!', err, receipt)
                  if (!err) {
                    owned.receipt.val = receipt
                    pay.emit('bought', {
                      label: product.key,
                      receipt: receipt
                    })
                    next()
                  } else {
                    pay.emit('error', err)
                    owned._input = false
                    next(true)
                  }
                }
              })
            } else {
              pay.emit('error',
                'buy failed: could not determine storeId of ' + product.key +
                'with value ' + product._val
              )
            }
          }
        }
      }
    },
    receipt: false
  },
  on: {
    value (data, event) {
      var product = this
      if (product._templated) {
        console.log('pop dat validateProducts?')
        return
      }
      var val = product._input
      if (val instanceof Observable) {
        val = val.val
      }
      if (typeof val === 'string') {
        let templateKey
        while ((templateKey = TEMPLATED.exec(val))) {
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
        while ((found = TEMPLATED.exec(val))) {
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
