'use strict'

exports.store = 'mockStore'

exports._platform = {
  on: {
    getProducts (data) {
      console.log('[mock getProducts]')
      data.cb(null, mockProducts)
    },
    buy (obj) {
      console.log('[mock buy]')
      obj.cb(null, mockReceipt)
    }
  }
}

var mockProducts = {
  'single_mock': {
    'price': 0.99
  },
  'monthly_mock': {
    'price': 9.99
  },
  'yearly_mock': {
    'price': 9000.99
  }
}

var mockReceipt = 'mockReceipt!'
