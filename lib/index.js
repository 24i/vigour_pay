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

// little dirtyfix:
module.exports.store.emit('value')
