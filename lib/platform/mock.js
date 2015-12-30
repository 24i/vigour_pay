'use strict'
var testData = require('../../test/testData')
var agent = require('vigour-ua')(navigator.userAgent)

exports.store = agent.os === 'iOS'
  ? 'iOS'
  : 'android'

exports._platform = {
  on: {
    getProducts (data) {
      var cb = data.cb
      if (this.activeMode) {
        cb(null, testData.products)
      } else {
        cb(null)
      }
    },
    buy (obj) {
      if (this.activeMode) {
        obj.cb(null, testData.receipt)
      } else {
        obj.cb(null)
      }
    }
  }
}
