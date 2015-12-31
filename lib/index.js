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

console.log('index injects config', config)

module.exports = new Plugin({
  inject: [
    shared,
    config,
    platform
  ]
})

// DIRTY FIX
console.log('dirty fix.. try..', module.exports.store.val)
var Event = require('vigour-js/lib/event')
var e = new Event()
e.isTriggered = true
module.exports.store.emit('value', true, e)
e.trigger()
