'use strict'

exports.store = 'mockStore'

exports._platform = {
  on: {
    init (data) {
      // console.error('----------- yes platform init emit!', data)
    },
    getProducts (data) {
      // console.error('[mock getProducts]')
      data.cb(null, mockProducts)
    },
    buy (obj) {
      // console.error('[mock buy]')
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
