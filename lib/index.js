'use strict'

var Plugin = require('vigour-wrapper/lib/plugin')

var Config = require('vigour-config')

var config = new Config().pay.serialize()
var platform = require('./platform')
var shared = require('./shared')

console.log('index injects config', config)

var pay = module.exports = new Plugin({
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
