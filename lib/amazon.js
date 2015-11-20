'use strict'

var Observable = require('vigour-js/lib/observable')

var shared = require('./shared')

const AMAZON_WEB_API = 'https://resources.amazonwebapps.com/v1/latest/Amazon-Web-App-API.min.js'
const AMAZON_WEB_API_TESTING = 'https://resources.amazonwebapps.com/v1/latest/Amazon-Web-App-API-tester.min.js'
var script = document.createElement('script')
var script_testing = document.createElement('script')

script.onerror = () => {
  this.emit('error', 'Amazon script load error')
}
script_testing.onload = () => {
  amzn_wa.enableApiTester(amzn_wa_tester)
}

document.getElementsByTagName('head')[0].appendChild(script)
script.src = AMAZON_WEB_API
script.id = 'amazon-script'

document.getElementsByTagName('head')[0].appendChild(script_testing)
script_testing.src = AMAZON_WEB_API_TESTING
script_testing.id = 'amazon-script-testing'

var amazon = document.addEventListener("amazonPlatformReady", function(data) {
  if (amzn_wa.IAP == null) {
    console.log("Amazon In-App-Purchasing only works with Apps from the Appstore");
  }
  else {
    amzn_wa.IAP.registerObserver({
      'onSdkAvailable': function(resp) {
        if (resp.isSandboxMode) {
          console.log("Testing mode")
        }
        amzn_wa.IAP.getPurchaseUpdates(amzn_wa.IAP.Offset.BEGINNING);
      }
    });
  }
})

module.exports = new Observable({
  ready: false,
  store: 'amazon',
  inject: shared,
  amazonApi: amazon,
  define: {
    buy (label, callback) {
      var response
      amzn_wa.IAP.registerObserver(
        {"onPurchaseResponse": (purchasedItem) =>  {
          response = {
            receipt:purchasedItem.jsReqId,
            status:purchasedItem.purchaseRequestStatus
          }
          callback(null,response)
        }
      })
      amzn_wa.IAP.purchaseItem(label)
    },
    verifyProducts (callback) {
      console.log('---- verifyProducts!')
      var pay = this
      debugger

      // get products from amazon SDK

      // then verify the configured products:
      var products = pay.products
      products.each((val, key) => {
        console.log('verify', key, val.plain())
      })
    }
  }
}).Constructor

