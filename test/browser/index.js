'use strict'

var sharedTests = require('../tests')
var config = require('../config')
var pay

require('./mockNativeMethods')

describe('Pay automated tests', function () {
  describe('shared + mock', function () {

  })

  describe('shared + bridged + mock Native', function () {
    it('should require bridged module', function () {
      pay = window.vigour_pay = require('../../lib/bridged')
      expect(pay).to.be.ok
    })

    it('should be able to hack in store config', function () {
      console.log('wut', pay)
      pay.set({
        _config: config,
        region: 'testRegion',
        store: 'testStore'
      })
      
      expect(pay).to.have.property('products')

      expect(pay.products).to.have.property('single')
        .which.has.property('val', 'testRegion_single_test')

      expect(pay.products).to.have.property('monthly')
        .which.has.property('val', 'testRegion_monthly_test')

      expect(pay.products).to.have.property('yearly')
        .which.has.property('val', 'testRegion_yearly_test')

    })

    sharedTests()
  })
})
