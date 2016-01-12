'use strict'

// hack dat userAgent

require('./style.less')
var Element = require('vigour-element')
Element.prototype.inject(
  require('vigour-element/lib/property/text'),
  require('vigour-element/lib/property/transform'),
  require('vigour-element/lib/property/css'),
  require('vigour-element/lib/property/attributes'),
  require('vigour-element/lib/events/render'),
  require('vigour-element/lib/events/click')
)

// require facebook
var pay = require('../lib/')
// pay.init()
// console.clear()

var plain = require('vigour-js/lib/methods/plain')
var Observable = require('vigour-js/lib/base')
Observable.prototype.inject(plain)

var script_testing = document.createElement('script')
const AMAZON_WEB_API_TESTING = 'https://resources.amazonwebapps.com/v1/latest/Amazon-Web-App-API-tester.min.js'
document.getElementsByTagName('head')[0].appendChild(script_testing)
script_testing.src = AMAZON_WEB_API_TESTING
script_testing.id = 'amazon-script-testing'

script_testing.onload = () => {
  amzn_wa.enableApiTester(amzn_wa_tester)
}

var App = require('vigour-element/lib/app')

window.pay = pay
// debugger

var Input = new Element({
  node: 'input'
}).Constructor

var app = new App({
  node: document.body,
  holder: {
    input: new Input()
  }
})
