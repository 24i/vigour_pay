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
        "val": "mtv-play_single_episode_purchase",
        "type": "single-purchase"
      },
      "monthly": {
        "val": "mtvplay_subscription_monthly",
        "type": "monthly-recurring-subscription"
      },
      "yearly": {
        "val": "mtvplay_single_purchase",
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
      "monthly": "amazon_monthly_id",
      "yearly": "amazon_yearly_id"
    }
  }
})
console.log('haha pkg', pkg)

// require facebook
var Pay = require('../lib/')


var plain = require('vigour-js/lib/methods/plain')
var Base = require('vigour-js/lib/base')
Base.prototype.inject(plain)

// Object.getPrototypeOf(Pay.prototype).inject(plain)

var pay = new Pay()

window.p = pay

function payString(pay) {
  return JSON.stringify(pay.plain(filterPay, true), false, 2)
}

function filterPay (val, key) {
  return key !== 'bridge'
}

console.log('???????????', pay.plain(filterPay, true))

// console.log('?????????????', payString(pay))

var app = new Element({
  node: document.body,
  topbar: {
    header: {
      text: 'Pay example app lala'
    }
  },
  state: {
    text: payString(pay)
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

  pay.products.each((val, key) => {
    console.log('-- have product', key)
    val.on(() => {
      writeStatus()
    })
  })
} else {
  console.warn('hey this platform seems to be incompatible with pay :(')
}

function writeStatus () {
  app.state.text.val = payString(pay)
}
