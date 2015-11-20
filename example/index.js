'use strict'

// hack dat userAgent

require('./style.less')
var Element = require('vigour-element')
Element.prototype.inject(
  require('vigour-element/lib/property/text'),
  require('vigour-element/lib/property/transform'),
  require('vigour-element/lib/property/css'),
  require('vigour-element/lib/property/attributes'),
  require('vigour-element/lib/events/render')
)

var _ = require('lodash')

// sneaky fix for package.json

var pkg = require('package.json')
_.set(pkg, ['vigour', 'pay'], {
  "android": {
    "billingKey": "SUPASECRETwhatevs",
    "products": {
      "single": {
        "id": "mtv-play_single_episode_purchase",
        "type": "single-purchase"
      },
      "monthly": {
        "id": "mtvplay_subscription_monthly",
        "type": "monthly-recurring-subscription"
      },
      "yearly": {
        "id": "mtvplay_single_purchase",
        "type": "yearly-recurring-subscription"
      }
    }
  },
  "iOS": {
    "products": {
      "single": "{region}_single_purchase",
      "monthly": "{region}_subscription_monthly",
      "yearly": "{region}_subscription_annual"
    }
  },
  "amazon": {
    "products": {
      "weekly": {
        "description":"Bla Bla Bla Bla Bla Bla Bla Bla Bla Bla",
        "itemType": "SUBSCRIPTION",
        "smallIconUrl":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbDrhKZOXslT-RN6_Ni2CQ8fz7ECxdhODu1hXEE8dGp5ollj2JRA",
        "title":"Subscription dede",
        // "price":140.0, // omg no price in here!
        "subscriptionParent":"test",
        "currencyPriceMap":{"US":0.0},
        "languageDescriptionMap":{"US":"—"},
        "languageTitleMap":{"US":"—"}
      },
      "monthly": "amazon_montly_id",
      "yearly": "amazon_yearly_id"
    }
  }
})


// require facebook
var Pay = require('../lib/')

var plain = require('vigour-js/lib/methods/plain')
Object.getPrototypeOf(Pay.prototype).inject(plain)

var pay = new Pay()

var app = new Element({
  node: document.body,
  topbar: {
    header: {
      text: 'Pay example app'
    }
  },
  state: {
    text: JSON.stringify(pay.plain(), false, 2)
  },
  // pay stuff
  buying: {
    helper: {
      text: 'buy:',
      node: 'span'
    },
    label: {
      node: 'input',
      text:"weekly"
    },
    button: {
      node: 'button',
      text: 'buy dat',
      on: {
        click () {
          var productLabel = app.buying.label.node.value
          pay.buy(productLabel, (err, response) => {
            debugger
            console.log('---> BUY CALLBACK!', err, response)
          })
        }
      }
    }
  }
})

if(pay.val) {
  pay.on('error', function (err) {
    console.error(err)
  })

  pay.ready.on(() => {
    console.log('---- pay.ready!')
    writeStatus()
  })

  pay.products.on(() => {
    console.log('---- pay.products!')
    writeStatus()
  })
} else {
  console.warn('hey this platform seems to be incompatible with pay :(')
}

function writeStatus () {
  app.state.text.val = JSON.stringify(pay.plain(), false, 2)
}
