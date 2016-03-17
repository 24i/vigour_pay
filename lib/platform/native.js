'use strict'

var env = require('vigour-env')
exports.store = env.platform.val

// console.log('STORE STORE STORE', exports.store)

var pkg = require('../../package.json')
var injection = require('vigour-wrapper-bridge/lib/plugin/injection')

exports._platform = {
  inject: injection(pkg.name),
  ready: {
    on: {
      data: function () {
        // console.log('overwritten?')
      }
    }
  },
  on: {
    getProducts (obj) {
      // console.log('native platform getProducts handler!')
      alert('[native pay] sending getProducts')
      var cb = obj.cb
      var products = obj.products.plain()
      // console.log('send to native: getProducts with', products)
      this.send('getProducts', products, function gotProducts (err, storeProducts) {
        alert('[native pay] getProducts callback!')
        if (err) {
          try {err = JSON.stringify(err)}catch(err) {}
          alert('error! ' + err)
        } else {
          let alertit
          try {alertit = JSON.stringify(storeProducts)}catch(err) {}
          alert('no error!' + alertit)
        }
        // console.log('got native products', err ? 'ERROR' : 'storeProducts', err || storeProducts)
        cb(err, storeProducts)
      })
    },
    buy (obj) {
      alert('[native pay] emit buy!')
      // console.log('[pay native] emit buy!', obj)
      this.send('buy', { id: obj.id }, function bought (err, receipt) {
        alert('[native pay] bought callback!' + receipt)
        if (obj.cb) {
          obj.cb(err, receipt)
        }
      })
    }
  }
}
