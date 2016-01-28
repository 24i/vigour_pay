# pay
Native store purchasing and web payment

## Install
`npm install vigour-pay`

## Updates via upstream remote

- `git remote add skeleton git@github.com:vigour-io/plugin.git`
- `git pull skeleton develop`

## Usage
See [tests](test)

## Building native apps
See [wrapper](http://github.com/vigour-io/vigour-native)

## Specs

## Config

configuration for `pay` should go in the app's `package.json`

```json
{
  "vigour": {
    "pay": {
      "android": {
        "billingKey": "SUPASECRETwhatevs",
        "products": {
          "single": {
            "id": "mtv-play_single_episode_purchase",
            "type": "single-purchase"
          },
          "monthly": {
          	"id": "mtvplay_subscription_monthly",
            "type": "monthly-recurring-subscription"
          },
          "yearly": {
          	"id": "mtvplay_single_purchase",
            "type": "yearly-recurring-subscription"
          }
        }
      },
      "iOS": {
        "products": {
          "single": "{region}_single_purchase",
          "monthly": "{region}_subscription_monthly",
          "yearly": "{region}_subscription_annual"
        }
      },
      "fire": {
        "products": {
          "single": "fire_single_id",
          "monthly": "fire_montly_id",
          "yearly": "fire_yearly_id"
        }
      }
    }
  }
}
```

## Use of the Module

### new Pay(settings)
```javascript
var Pay = require('vigour-pay')

var pay = new Pay()
```
###### when using templating for region specific product id's: set region
```javascript
config.region.on((region) => {
  pay.set({region: region})
})
```

### pay.buy(label, callback(err, response))
`pay.buy(label, callback)` Will attempt to buy whatever product is configured as `label` for the current platform. `label` being `single`, `monthly` or `yearly` when using the above config.
```javascript
button.onClick(() => {
  pay.buy('monthly', (err, response) => {
    if (err) { // something broke down
      throw err
    }
    var receipt = response.receipt
    if (receipt) { // purchased dat "monthly"!
    	user.set({owns: {monthly: receipt}}) // update the user
      if (myBackEndUpdater) { // lets tell some other back end
        myBackEndUpdater(user.id.val, receipt)
      }
    } else {
      // everything worked, but the user cancelled the purchase at some point
      // console.log('dude why dont u buy? (gif monne)')
    }
  })
})
```

### pay.products (Observable property)
`pay.products` is a list of available products,
- based on the `config` + platform
- __validated__ and __completed__ by the native Plugin

#### e.g.
```javascript
pay.products.val = {
  single: {
    val: 'NL_single_purchase',
    owned: {
      val: true,
      receipt: {
        hash: 'garblegarble'
      }
    },
    price: 0.99
  },
  monthly: {
    val: 'NL_monthly_subscription',
    owned: true,
    price: 4.99
  },
  yearly: {
    val: 'NL_yearly_subscription',
    price: 19.99
  }
}
```

#### pay.products[label].owned
`owned` is
- if owned
  - `true`
  - could have `receipt` property when available
- if not owned
  - `false`
  - `undefined` (property doesn't exist).

#### pay.products[label].price

Price is the number of `pay.currency` one has to pay in order to buy `product`.

### pay.currency

The type of moneys the store wants to use.

```javascript
pay.currency.val = {
  val: '€',
  name: 'Euro'
}
```

## Native Plugins

### Methods

#### buy(productId, callback(error, response))

- buy the product with `productId`
- when done, call callback passing
  - `error`
  - `response`

#### getProducts(callback(err, response))

Used to

- get products available for this app on this platform

In order to

- ensure products in `package.json` are actually available in the store
- get `product.price`
- get `product.owned`

##### response

response should look like:
```javascript
var response = {
  productId1: {
    price: 999.01,
    owned: { // check if the device's store account owns the product
      val: true,
      receipt: 'RECEIPTFORPRODUCT'
    }
    // platform specific info may go here
  },
  productId2: {
    price: 0.99
  }
}
```
