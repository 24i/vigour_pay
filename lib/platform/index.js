'use strict'
var env = require('vigour-env')

env.isAmazon.val = false
var ISAMAZON = /amazon-fireos|AmazonWebAppPlatform|; AFT/
if (ISAMAZON.test(navigator.userAgent)) {
  env.isAmazon.val = true
}

if (env.isNative.val) {
  module.exports = require('./native')
} else if (env.isAmazon.val) {
  module.exports = require('./amazon')
} else {
  module.exports = require('./mock')
}
