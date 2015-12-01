'use strict'

var pkg = require('../../package.json')
var bridge = require('vigour-wrapper/lib/bridge/inject')

var ua = require('vigour-ua')
var agent = ua(navigator.userAgent)
var store = agent.os === 'iOS'
  ? 'iOS'
  : 'android'

module.exports = {
  inject: bridge(pkg.name),
  store: store,
  platform: {
    on: {
      getProducts (cb) {
        var pay = this.parent
        pay.send('getProducts', {}, function gotProducts (err, storeProducts) {
          cb(err, storeProducts)
        })
      },
      buy (obj) {
        var pay = this.parent
        pay.send('buy', { id: obj.id }, function bought (err, receipt) {
          console.log('buy response', arguments)
          if (obj.cb) {
            obj.cb(err, receipt)
          }
        })
      }
    }
  }
}
