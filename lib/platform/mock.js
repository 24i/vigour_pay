'use strict'

var pkg = require('../../package.json')
var testData = require('../../test/testData')
var agent = require('vigour-ua')(navigator.userAgent)

exports.store = agent.os === 'iOS'
  ? 'iOS'
  : 'android'

exports._platform = {
  on: {
    getProducts (cb) {
      // console.warn('[Pay] mock platform')
      if (this.activeMode) {
        cb(null, testData.products)
      } else {
        cb(null)
      }
    },
    buy (obj) {
      // console.warn('[Pay] mock platform')
      if (this.activeMode) {
        obj.cb(null, testData.receipt)
      } else {
        obj.cb(null)
      }
    }
  }
}
