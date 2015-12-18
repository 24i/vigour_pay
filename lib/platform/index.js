'use strict'
var env = require('vigour-env')
var isAmazon = false
if (navigator && /amazon-fireos|AmazonWebAppPlatform|; AFT/.test(navigator.userAgent)) {
  isAmazon = true
}

if (env.isNative.val) {
  module.exports = require('./mock')
} else if (isAmazon) {
  module.exports = require('./amazon')
} else {
  module.exports = require('./mock')
}
