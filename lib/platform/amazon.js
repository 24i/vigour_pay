'use strict'

const SCRIPT_SRC = '//resources.amazonwebapps.com/v1/latest/Amazon-Web-App-API.min.js'
const SCRIPT_ID = 'amazon-script'
const AMAZON_WEB_API_TESTING = 'https://resources.amazonwebapps.com/v1/latest/Amazon-Web-App-API-tester.min.js'

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
      script.onerror = (err) => {
        console.error('=========== amazon sdk script load error:', err)
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
          amazon.scriptLoaded.val = true
          registerObserver(pay)
        }
      })

      script.onload = () => {

        var DO_TEST_SDK = true//window.beAmazon
        if (DO_TEST_SDK) {
          var script_testing = document.createElement('script')
          script_testing.src = AMAZON_WEB_API_TESTING
          script_testing.id = 'amazon-script-testing'
          script_testing.onload = () => {
            amzn_wa.enableApiTester(amzn_wa_tester)
          }
          document.getElementsByTagName('head')[0].appendChild(script_testing)
        }

        amazon.scriptLoaded.val = true
      }
      // console.error('put amazon in head')
      document.getElementsByTagName('head')[0].appendChild(script)
    },
    getProducts (data) {
      var products = []
      products.push(data.products.monthly.val, data.products.yearly.val, data.products.single.val)
      var reqid = amzn_wa.IAP.getItemData(products)
      this._loadingCatalog[reqid] = data
    },
    buy (obj) {
      amzn_wa.IAP.purchaseItem(obj.id)
      let responseId = obj.responseId
      var buying = this._buying
      if (buying[responseId]) {
        console.error('==== WICKED! that reqid already exists!')
        throw Error('reqid exists, impossible to keep track of buying this way')
      }
      this._buying[responseId] = obj
      this._buying[obj.id] = obj
    }
  },
  _buying: {
    useVal: {}
  },
  _loadingCatalog: {
    useVal: {}
  }
}

function registerObserver (pay) {
  // console.log('amazon registerObserver!')
  var amazon = pay._platform
  amzn_wa.IAP.registerObserver({
    onSdkAvailable (resp) {
      // console.log('amazon sdk is available!')
      if (resp.isSandboxMode) {
        // console.log('amazon Testing mode')
      }
      amazon.ready.val = true
    },
    onItemDataResponse (response) {

      //get the response sku here
      var loaded = amazon._loadingCatalog[response.jsReqId]
      if (!loaded) {
        pay.emit('error', {
          message: 'unexpected onItemDataResponse',
          response
        })
      } else {
        var cb = loaded.cb
        if (cb) {
          let err
          let catalog
          let errMessage
          switch (response.itemDataRequestStatus) {
            case 'INVALID_INPUT':
              errMessage = 'invalid amazon productId'
              break
            default:
              err = null
              catalog = response.itemData
              if (!catalog) {
                errMessage = 'uncaught amazon catalog list error'
              }
          }
          if (errMessage) {
            err = makeErr({
              message: errMessage,
              response
            })
          }
          cb(err, catalog)
        }
      }
    },
    onPurchaseResponse (response) {
      var buying = amazon._buying[response.receipt.sku]
      if (!buying) {
        pay.emit('error', {
          message: 'error parsing onPurchaseResponse: could not match jsReqId in amazon._buying',
          response
        })
      } else {
        var cb = buying.cb
        if (cb) {
          let err
          let receipt = {}
          let errMessage
          switch (response.purchaseRequestStatus) {
            case 'FAILED':
              errMessage = 'amazon purchase failed'
              break
            case 'INVALID_SKU':
              errMessage = 'invalid amazon productId'
              break
            case 'ALREADY_ENTITLED':
              errMessage = 'amazon product already owned'
              break
            default:
              err = null
              receipt.receiptId = response.receipt &&
                response.receipt.purchaseToken
              receipt.userId = response.userId

              if (!receipt) {
                errMessage = 'uncaught amazon purchasing error'
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
