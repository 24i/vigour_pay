'use strict'

// hack dat userAgent

require('./style.less')
var Element = require('vigour-element')

var app = require('vigour-element/lib/app')

// console.log('------------------ require pay')
var pay = require('../lib/')
// console.log('------------------ required pay')

var plain = require('vigour-js/lib/methods/plain')
var Observable = require('vigour-js/lib/base')
Observable.prototype.inject(plain)

if (navigator && /amazon-fireos|AmazonWebAppPlatform|; AFT/.test(navigator.userAgent)) {
  // testing sdk not necessary for production
  var script_testing = document.createElement('script')
  const AMAZON_WEB_API_TESTING = 'https://resources.amazonwebapps.com/v1/latest/Amazon-Web-App-API-tester.min.js'
  document.getElementsByTagName('head')[0].appendChild(script_testing)
  script_testing.src = AMAZON_WEB_API_TESTING
  script_testing.id = 'amazon-script-testing'

  script_testing.onload = () => {
    amzn_wa.enableApiTester(amzn_wa_tester)
  }
}

window.pay = pay

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

var Clearproducts = new Element({
  node: 'button',
  text: 'Clear your purchases'
}).Constructor

app.set({
  node: document.body,
  holder: {
    month: new Monthly(),
    year: new Yearly(),
    single: new Single(),
    clearproducts: new Clearproducts()
  }
})

pay.on('bought', function (receipt) {
  // console.log('----bougth receipt confirmation ---', receipt)
})
pay.on('error', function (error) {
  // console.error('error when buying item ------   ', error.key)
})

var month = document.getElementsByClassName('month')[0]
var year = document.getElementsByClassName('year')[0]
var single = document.getElementsByClassName('single')[0]
var clearproducts = document.getElementsByClassName('clearproducts')[0]

clearproducts.onclick = function () {
  localStorage.clear()
  // console.log('localstorage is empty now!----')
}

month.onclick = function (argument) {
  pay.products.monthly.owned.val = true
}

year.onclick = function (argument) {
  pay.products.yearly.owned.val = true
}

single.onclick = function (argument) {
  pay.products.single.owned.val = true
}
