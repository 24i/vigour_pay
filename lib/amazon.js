'use strict'

var Observable = require('vigour-js/lib/observable')
var shared = require('./shared')
var script = document.createElement('script')
var script_testing = document.createElement('script')

const AMAZON_WEB_API = 'https://resources.amazonwebapps.com/v1/latest/Amazon-Web-App-API.min.js'
const AMAZON_WEB_API_TESTING = 'https://resources.amazonwebapps.com/v1/latest/Amazon-Web-App-API-tester.min.js'

script.onerror = () => {
  this.emit('error', 'Amazon script load error')
}

script.onload = () => {
  document.getElementsByTagName('head')[0].appendChild(script_testing)
  script_testing.src = AMAZON_WEB_API_TESTING
  script_testing.id = 'amazon-script-testing'
}

script_testing.onload = () => {
  amzn_wa.enableApiTester(amzn_wa_tester)
}

document.getElementsByTagName('head')[0].appendChild(script)
script.src = AMAZON_WEB_API
script.id = 'amazon-script'


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
      }
    });
  }
})

module.exports = new Observable({
  ready: false,
  store: 'amazon',
  inject: shared,
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
    getProducts (callback) {
      return amzn_wa.IAP._amazonClient._items
    },


    // verifyProducts (callback) {
    //   var pay = this
    //   var products = pay.products

    //   var map = {}
    //   products.

    //   var amazonProducts = amzn_wa.IAP._amazonClient._items



    //   products.each((val, appKey) => {


    //     if (amzn_wa.IAP._amazonClient._items[key]){
    //       // set the item on the plugin
    //       val.set({'price':amzn_wa.IAP._amazonClient._items[key].price})

    //       console.log("Alright this one you can buy " + key + " product")
    //     }
    //     else {
    //       console.warn("Wow! looks that the product " + key + " is not available on the amazon store")
    //       //It means that the products loaded from the package json, contains one item that is not in
    //       //the amazon Object. console.warning("beng!")
    //     }

    //     // console.log('verify', key, val.plain())
    //   })


    }
  }
}).Constructor

