'use strict'

var pkg = require('../../package.json')
var agent = require('vigour-ua')(navigator.userAgent)

exports.store = agent.os === 'iOS'
  ? 'iOS'
  : 'android'

exports._platform = {
  inject: require('vigour-wrapper/lib/bridge/inject')(pkg.name),
  on: {
    getProducts (cb) {
      console.warn('[Orientation] mock platform')
      cb(null)
    },
    buy (obj) {
      console.warn('[Orientation] mock platform')
      obj.cb(null)
    }
  }
}
