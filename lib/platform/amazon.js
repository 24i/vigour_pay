'use strict'

var Observable = require('vigour-js/lib/observable')
var shared = require('./shared')

module.exports = new Observable({
  ready: false,
  initialised: false,
  store: 'amazon',
  inject: shared,
  define: {
    init () {
      var pay = this
      if (pay.ready.val) {
        return true
      } else {
        if (!pay.initialised.val) {
          init()
        }
        return false
      }
    },
    buy (label, callback) {
      var pay = this
      if (pay.init()) {
        var response
        amzn_wa.IAP.registerObserver({
          onPurchaseResponse: (purchasedItem) => {
            response = {
              receipt: purchasedItem.jsReqId,
              status: purchasedItem.purchaseRequestStatus
            }
            callback(null, response)
          }
        })
        amzn_wa.IAP.purchaseItem(label)
      } else {
        console.error('buy before init > not implemented')
      }
    },
    getProducts (callback) {
      var amazonProducts = amzn_wa.IAP._amazonClient._items
      callback(null, amazonProducts)
    }
  }
}).Constructor

function init (pay) {
  conosle.log('yesyes init dat pay')
  
  pay.initialised.val = true
  var script = document.createElement('script')
  var script_testing = document.createElement('script')

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

  document.addEventListener('amazonPlatformReady', function (data) {
    if (amzn_wa.IAP == null) {
      console.log('Amazon In-App-Purchasing only works with Apps from the Appstore')
    } else {
      amzn_wa.IAP.registerObserver({
        'onSdkAvailable': function (resp) {
          if (resp.isSandboxMode) {
            console.log('Testing mode')
          }
        }
      })
    }
  })
}

function initFB (fb) {
  fb.initialised.val = true
  fb._isLoading('init')
  var fbWeb = fb.web
  // set up window callback for SDK script loaded
  window.fbAsyncInit = function fbAsyncInit () {
    fb.ready.val = true
    fb._isNotLoading('init')

    var appId = fb.appId && fb.appId.val
    if (!appId) {
      throw new Error(ERR_APP)
    }
    FB.init({
      appId: appId,
      xfbml: fbWeb && fbWeb.xfbml && fbWeb.xfbml.val,
      version: fbWeb && fbWeb.version && fbWeb.version.val
    })
    FB.getLoginStatus((response) => {
      fb.loginResponse(response)
      // do queued stuff
      for (let key in fb._queue) {
        fb[key].apply(fb, fb._queue[key])
      }
    })
  }
  // insert script
  var src = fbWeb && fbWeb.src && fbWeb.src.val
  if (!src) {
    throw new Error(ERR_SRC)
  }
  var scriptElement = makeScriptElement(src, SDK_ID)
  document.getElementsByTagName('head')[0].appendChild(scriptElement)
}

function makeScriptElement (src, id) {
  var script = document.createElement('script')
  script.onerror = function () {
    this.emit('error', 'script load error! src:' + src + ' id:' + id)
  }
  script.src = src
  script.id = id
  return script
}
