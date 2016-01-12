'use strict'
var env = require('vigour-env')
var isAmazon = true
if (navigator && /amazon-fireos|AmazonWebAppPlatform|; AFT/.test(navigator.userAgent)) {
  isAmazon = true
}

console.log('PLATFORM DETECT')

if (env.isNative.val) {
  console.log('NATAF', env.isNative.val)
  module.exports = require('./native')
} else if (isAmazon) {
  console.log('AMAZAN', isAmazon, navigator.userAgent)
  module.exports = require('./amazon')
} else {
  console.log('MOCK wat')
  module.exports = require('./mock')
}
