# Nion: network input/output normalizer

## Introduction
Nion is a small caching json-api client built on top of redux.

Essentially though, nion is a set of redux compliant functions and utilities that automatically normalizes json-api entity data into a predictable state tree.

### features
* Trivial interface through `dataKeys` which binds API data under user defined keys. This makes it easy to map entity data back to your application and share across component containers.
* Network i/o data automatically bound to `dataKeys`. Makes it easy to see whether your request is loading, or has errors.
* Entity relationships are automatically resolved when selected from state.
* Generic entity cache which means it's extensible to support other transport protocols or other formats.

## Usage
### Making an API request and mapping the request to component state
In this container example we create a dispatch action that makes an API request to the current_user endpoint and defined the `dataKey` currentUser to reference it. Then we select the `dataKey` which maps the result into our container state.

```
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import { jsonApi } from 'libs/nion/actions'
import { selectData } from 'libs/nion/reducers'

import Page from '../components/Page'

const mapStateToProps = createSelector(
    selectData(['currentUser']),
    (data) => ({
        data
    })
)

const mapDispatchToProps = dispatch => {
    return {
        getCurrentUser: (endpoint, params) => {
            dispatch(jsonApi.get({
                dataKey: 'currentUser',
                endpoint: 'current_user,
                includes: [],
                fields: {}
            }))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Page)
```

In the example above it's important to understand the `dataKey` interface. Not only are `dataKeys` used to link data internally across reducers. They give context to requests such as `currentUser`. Any component that now need this request data may select the `currentUser` key. This allows us to define higher level meaning to our requests in a dynamic way. Furthermore, if a component selects `dataKey` that was already fetched, or is fetching, we will return the same result without making additional network calls (unless we force it).


### How to initialize nion
In your application you may use `configureStore()` which is a convenience function to enable our middleware. Simply pass `nion: true` into `configureStore()` which to enable this middleware. Underneath all that is happening is we are adding a top level `nion` reducer to our state tree.

```
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import configureStore from 'shared/configure-store'
import ReactWrapper from 'components/ReactWrapper'
import AppContainer from './containers/AppContainer'

const storeOptions = {
    nion: true
}

const store = configureStore({}, storeOptions)

ReactDOM.render(
    <ReactWrapper>
        <Provider store={ store }>
            <AppContainer />
        </Provider>
    </ReactWrapper>,
    document.getElementById('reactTarget')
)
```

## Core details
### Actions
Interface for making API requests. The `jsonApi` object exposes each action to make a json-api request. More information outlined below in API reference section. If you would like to read more about what the API request library: [api-redux-middleware](https://www.npmjs.com/package/redux-api-middleware#defining-the-api-cal).

### Reducers
Nion can be broken down to 3 reducers: `entities`, `references`, and `requests`. Breaking the reducers down, entities is the model cache which is a object keyed by the model type and ID. Models across all requests are normalized and stored within the entities reducer. The references reducer maps the top level request information along with the top level entity or entities. Finally, requests holds lifecycle information of a given API request including any error information.

### Normalizers / Denormalizers
Entities that are stored must be normalized into our entity cache. Once a json-api response is successfully returned we parse out all included entities and meta information before it is dispatched. Reciprocally when `selectData()` is called the entity hierarchy tree is denormalized back to its original shape.

## API reference
### Making json-api requests
```jsonApi.get({dataKey, endpoint, includes=[], fields={}})```
```jsonApi.post({dataKey, endpoint, includes=[], fields={}, body={}})```
```jsonApi.patch({dataKey, endpoint, includes=[], fields={}, body={}})```
```jsonApi.delete({dataKey, endpoint, includes=[], fields={}})```

`dataKey`: binds the request and entities together and is used to map the request data back to state.
`endpoint`: is the relative path string of the endpoint you want to request.
`includes`: is a list allows you to specify any entity relationships that should be included in the request.
`fields`: is an object that allows you to explicitly define which entity attributes you would want included in the request.
`body`: is an object which is the payload of your request to the server.

```jsonApi.request(dataKey, request)```
This function allows you to define the raw API request data. See [api-redux-middleware](https://www.npmjs.com/package/redux-api-middleware#defining-the-api-cal). for more details.

## Selecting data
```selectData([key1, key2, key3, ...])```
List of `dataKeys` to select from nion state. This binds all relevant data for the a request into a single object. This includes request lifecycle information as well as the entity hierarchy.
