'use strict'

var Plugin = require('vigour-wrapper-bridge/lib/plugin')

var Config = require('vigour-config')
var config = new Config().pay

if (config) {
  config = config.serialize()
} else {
  throw Error('no pay config found')
}

var platform = require('./platform')
var shared = require('./shared')

// console.log('index injects config', config)

var pay = module.exports = new Plugin({
  inject: [
    shared,
    config,
    platform
  ]
})

// little dirtyfix:
pay.init()
console.log('------------>> [pay] pay.store.emit(\'value\')')
pay.store.emit('value')
