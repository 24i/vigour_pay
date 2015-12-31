'use strict'

var ua = require('vigour-ua')
var agent = ua(navigator.userAgent)

exports.store = agent.os === 'iOS'
  ? 'iOS'
  : 'android'

console.log('STORE STORE STORE', exports.store)

var pkg = require('../../package.json')
var bridge = require('vigour-wrapper/lib/bridge/inject')

exports._platform = {
  inject: bridge(pkg.name),
  on: {
    getProducts (obj) {
      console.log('native platform getProducts handler!')
      var cb = obj.cb
      var products = obj.products.plain()
      console.log('send to native: getProducts with', products)
      this.send('getProducts', products, function gotProducts (err, storeProducts) {
        console.log('got native products', err ? 'ERROR' : 'storeProducts', err || storeProducts)
        cb(err, storeProducts)
      })
    },
    buy (obj) {
      this.send('buy', { id: obj.id }, function bought (err, receipt) {
        if (obj.cb) {
          obj.cb(err, receipt)
        }
      })
    }
  }
}
