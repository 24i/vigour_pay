'use strict'
var env = require('vigour-env')

if (navigator && /amazon-fireos|AmazonWebAppPlatform|; AFT/.test(navigator.userAgent)) {
  isAmazon = true
}

// console.log('PLATFORM DETECT')

if (env.isNative.val) {
  console.log('[pay] NATAF', env.isNative.val)
  module.exports = require('./native')
} else if (isAmazon) {
  console.log('[pay] AMAZAN', isAmazon, navigator.userAgent)
  module.exports = require('./amazon')
} else {
  var isAmazon = window.beAmazon
  if (isAmazon) {
    module.exports = require('./amazon')
  } else {
    console.log('[pay] MOCK')
    module.exports = require('./mock')
  }
}
