'use strict'
var Observable = require('vigour-js/lib/observable')

var ua = require('vigour-ua')
var agent = ua(navigator.userAgent)
var ISAMAZON = /amazon-fireos|AmazonWebAppPlatform|; AFT/
if (ISAMAZON.test(navigator.userAgent)) {
  agent.os = 'amazon'
}

var target = global.env && global.env.target

if (target === 'android' || target === 'ios') {
  module.exports = require('./native')
// temp until env works!
} else if (agent.platform === 'ios' || agent.platform === 'android') {
  module.exports = require('./native')
} else if (agent.os === 'amazon') {
  module.exports = require('./amazon')
} else {
  module.exports = new Observable(false)
}
