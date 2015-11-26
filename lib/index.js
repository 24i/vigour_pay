'use strict'

var ua = require('vigour-ua')
var agent = ua(navigator.userAgent)

var Observable = require('vigour-js/lib/observable')

const ISAMAZON = /amazon-fireos|AmazonWebAppPlatform|; AFT/

// TODO: fix these checks!
var myPlatform
if (agent.os === 'Android' || ua.os === 'iOS' || true) { // native
  console.log('bridged!')
  myPlatform = require('./bridged')
} else if (ISAMAZON.test(navigator.userAgent)) { // amazon
  console.log('amazon!')
  myPlatform = require('./amazon')
} else if (agent.browser) { // web
  console.log('web!')
  // myPlatform = require('./web')
  myPlatform = require('./mock')
} else { // incompatible
  console.log('other! (incompatible)')
  myPlatform = require('./mock')
}

module.exports = myPlatform
