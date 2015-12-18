'use strict'

var Plugin = require('vigour-wrapper/lib/plugin')

var pkg = require('../package.json')
var config = pkg.vigour.pay

var Config = require('vigour-config')
var appConfig = new Config()

if (appConfig.pay) {
  let merge = require('vigour-js/lib/util/merge')
  merge(config, appConfig.pay.plain())
}

var platform = require('./platform')
var shared = require('./shared')

module.exports = new Plugin({
  inject: [
    shared,
    config,
    platform
  ]
})
