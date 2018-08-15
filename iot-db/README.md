## IOT DB MODULE
> db module for iotjs app


## Usage

```js
const setupDb = require('iotjs-db')

setupDb(config)
  .then(db => {
    const { Agent, Metric } = db
  })
  .catch(err => {
    console.error(err)
  })
```