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
      "single": "amazon_single_id",
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
      node: 'input'
    },
    button: {
      node: 'button',
      text: 'buy dat',
      on: {
        click () {
          alert('lets buy ' + app.buying.label.input + '!')
          var productLabel = app.buying.label.input
          pay.buy(productLabel, (err, response) => {
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
