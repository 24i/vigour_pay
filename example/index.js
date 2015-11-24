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

// require facebook
var Pay = require('../lib/')

var plain = require('vigour-js/lib/methods/plain')
var Observable = require('vigour-js/lib/base')
Observable.prototype.inject(plain)

var pay = new Pay()

window.p = pay

function payString (pay) {
  return JSON.stringify(pay.plain(void 0, true), false, 2)
}

console.log('???????????', pay.plain(void 0, true))

// console.log('?????????????', payString(pay))

var Product = new Element({
  label: {
    helper: {
      node: 'span',
      text: 'product (app) label:'
    },
    value:  {
      node: 'span',
      text: '...'
    }
  },
  id: {
    node: 'span',
    text: 'product label'
  }
}).Constructor

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
  products: {

  },
  buying: {

    helper: {
      text: 'buy:',
      node: 'span'
    },
    label: {
      node: 'input',
      text: "monthly"
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
    },
     button2: {
      node: 'button',
      text: 'check what I can buy',
      on: {
        click () {
          pay.verifyProducts()


          // (productLabel, (err, response) => {
          //   debugger
          //   console.log('---> BUY CALLBACK!', err, response)
          // })
        }
      }
    }
  },
  log: {
    text: 'messages will appear here...'
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
