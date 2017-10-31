# Getting Started

nion has a few dependencies that are needed under the hood, so it's necessary to install and configure them along with nion in order to use the library.

```bash
$ npm i --save nion redux-thunk
$ npm i --save-dev babel-plugin-transform-decorators-legacy
```

nion is used as a decorator function, so in order to use nion you need to enable decorator functions in your transpilation step. The way we do it is with babel, adding the following plugin to our babel configuration:

** .babelrc **
```
{
    "plugins": [
        "transform-decorators-legacy"
    ],
    ...
```

Finally, nion must be wired up to the redux store. This involves two steps - setting up the `redux-thunk` middleware (which is necessary for nion's async actions), and configuring nion and adding it to the redux store. Here's an extremely simple example setup:

```javascript
import { applyMiddleware, createStore, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'

import { configureNion } from 'nion'

export default function configureStore() {
    const configurationOptions = {}
    const { reducer: nionReducer } = configureNion(configurationOptions)

    const reducers = combineReducers({
        nion: nionReducer,
    })

    let store = createStore(reducers, applyMiddleware(thunkMiddleware))

    return store
}
```

### nion configuration
It's possible to set a number of options in the `configureNion` function, which are mainly focused on setting any [api-modules](./api-modules.md) that nion will use to interface with your API. The `configureNion` function takes a single options argument with the following options:

key | type | description
--- | ---- | -----------
`apiModules` | `{ [name]: ApiModule }` | a map of api-modules with keys corresponding to their names (used by the decorator to look up which module to use)
`defaultApi` | `string` |a string

### api modules
nion comes preconfigured to work out of the box with a generic [json-api](http://jsonapi.org/) compliant API module. In order to create custom API modules for your API, it's necessary to follow the guide [here](./api-modules.md)
