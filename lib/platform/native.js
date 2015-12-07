'use strict'

var ua = require('vigour-ua')
var agent = ua(navigator.userAgent)

exports.store = agent.os === 'iOS'
  ? 'iOS'
  : 'android'

var pkg = require('../../package.json')
var bridge = require('vigour-wrapper/lib/bridge/inject')

exports.inject = bridge(pkg.name)

exports._platform = {
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
        if (obj.cb) {
          obj.cb(err, receipt)
        }
      })
    }
  }
}
