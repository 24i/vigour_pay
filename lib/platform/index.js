'use strict'
var env = require('vigour-env')
var isAmazon
var ISAMAZON = /amazon-fireos|AmazonWebAppPlatform|; AFT/

if (ISAMAZON.test(navigator.userAgent)) {
  isAmazon = true
}

if (env.isNative.val) {
  module.exports = require('./native')
} else if (isAmazon) {
  module.exports = require('./amazon')
} else {
  module.exports = require('./mock')
}
