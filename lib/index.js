'use strict'

var ua = require('vigour-ua')
var agent = ua(navigator.userAgent)

var Observable = require('vigour-js/lib/observable')

const ISAMAZON = /amazon-fireos|AmazonWebAppPlatform|; AFT/

var incompatible = new Observable({
  val: false,
  ready: false
}).Constructor

// TODO: fix these checks!
var myPlatform
if (agent.os === 'Android' || ua.os === 'iOS') { // native
  console.log('bridged!')
  myPlatform = require('./bridged')
} else if (ISAMAZON.test(navigator.userAgent) || true) { // amazon
  console.log('amazon!')
  myPlatform = require('./amazon')
} else if (agent.browser) { // web
  console.log('web!')
  // myPlatform = require('./web')
  myPlatform = incompatible
} else { // incompatible
  console.log('other! (incompatible)')
  myPlatform = incompatible
}

module.exports = myPlatform
