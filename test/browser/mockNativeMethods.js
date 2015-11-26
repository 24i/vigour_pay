'use strict'

var nativeMethods = {
	getProducts (opts, cb) {
		console.log('ha fake getProducts!')

	},
	buy (productId, cb) {
		console.log('ha fake buy!')

	}
}

var bridge = require('vigour-wrapper/lib/bridge')
bridge.define({
  send (pluginId, fnName, opts, cb) {
    nativeMethods[fnName](opts, cb, bridge)
  }
})
