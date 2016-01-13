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

var App = require('vigour-element/lib/app')
var pay = require('../lib/')

var plain = require('vigour-js/lib/methods/plain')
var Observable = require('vigour-js/lib/base')
Observable.prototype.inject(plain)


//testing sdk not necessary for production
var script_testing = document.createElement('script')
const AMAZON_WEB_API_TESTING = 'https://resources.amazonwebapps.com/v1/latest/Amazon-Web-App-API-tester.min.js'
document.getElementsByTagName('head')[0].appendChild(script_testing)
script_testing.src = AMAZON_WEB_API_TESTING
script_testing.id = 'amazon-script-testing'

script_testing.onload = () => {
  amzn_wa.enableApiTester(amzn_wa_tester)
}

window.pay = pay

console.clear()
var Monthly = new Element({
  node: 'button',
  text: pay.products.monthly.val
}).Constructor

var Yearly = new Element({
  node: 'button',
  text: pay.products.yearly.val
}).Constructor

var Single = new Element({
  node: 'button',
  text: pay.products.single.val
}).Constructor


var app = new App({
  node: document.body,
  holder: {
    month: new Monthly(),
    year: new Yearly(),
    single: new Single()
  }
})



pay.on('bought',function (receipt) {
  console.log(receipt)
})
var month = document.getElementsByClassName('month')[0]
var year = document.getElementsByClassName('year')[0]
var single = document.getElementsByClassName('single')[0]

month.onclick = function (argument) {
  pay.products.monthly.owned.val = true
}

year.onclick = function (argument) {
  pay.products.yearly.owned.val = true
}

single.onclick = function (argument) {
  pay.products.single.owned.val = true
}

