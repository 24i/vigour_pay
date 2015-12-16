'use strict'

const SCRIPT_SRC = '//resources.amazonwebapps.com/v1/latest/Amazon-Web-App-API.min.js'
const SCRIPT_ID = 'amazon-script'

exports.store = 'amazon'

exports._platform = {
  scriptLoaded: {
    val: false,
    inject: require('vigour-js/lib/observable/is')
  },
  on: {
    init () {
      var amazon = this
      var pay = amazon.parent

      var script = document.createElement('script')
      var plugin = this.parent
      script.onerror = () => {
        plugin.initialised.val = false
        this.emit('error', 'amazon sdk script load error')
      }
      script.src = SCRIPT_SRC
      script.id = SCRIPT_ID

      document.addEventListener('amazonPlatformReady', function (data) {
        if (amzn_wa.IAP == null) {
          console.log(
            'Amazon In-App-Purchasing only works with Apps from the Appstore'
          )
        } else {
          registerObserver(pay)
        }
      })

      script.onload = () => {
        amazon.scriptLoaded.val = true
      }

      document.getElementsByTagName('head')[0].appendChild(script)
    },
    getProducts (cb) {
      var pay = this.parent
      var amazonProducts = amzn_wa.IAP &&
        amzn_wa.IAP._amazonClient &&
        amzn_wa.IAP._amazonClient._items
      var err = amazonProducts ? null : 'could not get products'
      if (err) {
        pay.emit('error', err)
      }
      cb(err, amazonProducts)
    },
    buy (obj) {
      var productId = obj.id
      var reqid = amzn_wa.IAP.purchaseItem(productId)
      this._buying[reqid] = obj
    }
  },
  _buying: {
    useVal: {}
  }
}

function registerObserver (pay) {
  var amazon = pay._platform
  amzn_wa.IAP.registerObserver({
    onSdkAvailable (resp) {
      console.log('sdk is available!')
      if (resp.isSandboxMode) {
        console.log('Testing mode')
      }
      amazon.ready.val = true
    },
    onPurchaseResponse (response) {
      console.log('got a purchase response', response)
      var buying = amazon._buying[response.jsReqId]
      if (!buying) {
        pay.emit('error', {
          message: 'unexpected onPurchaseResponse',
          response
        })
      } else {
        var cb = buying.cb
        if (cb) {
          let err
          let receipt
          let errMessage
          switch (response.purchaseRequestStatus) {
            case 'FAILED':
              errMessage = 'purchase failed'
              break
            case 'INVALID_SKU':
              errMessage = 'invalid amazon productId'
              break
            case 'ALREADY_ENTITLED':
              errMessage = 'product already owned'
              break
            default:
              err = null
              receipt = response.receipt &&
                response.receipt.purchaseToken
              if (!receipt) {
                errMessage = 'uncaught purchasing error'
              }
          }
          if (errMessage) {
            err = makeErr({
              message: errMessage,
              response
            })
          }
          cb(err, receipt)
        }
      }
    }
  })
}

function makeErr (info) {
  var err
  if (typeof info === 'object') {
    err = new Error(info.message)
    for (let key in info) {
      if (key !== 'message') {
        err.key = info[key]
      }
    }
  } else {
    err = new Error(info)
  }
  return err
}
