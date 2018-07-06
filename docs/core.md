# nion core

## Introduction

nion gives us a set of redux compliant functions and utilities that automatically normalizes API entity data into a predictable state tree. The default api module included with nion is built for json-api compliant json-api servers, but the client is extensible with any custom api module to support other transport layers.

### features

-   Client defined data mapping through `dataKeys`. This allows the us to define application specific context to API requests (ex. `currentUser`) and can be shared to all component containers that need this data.
-   Network i/o data automatically bound to `dataKeys`. Makes it easy to see whether your request is loading, or has errors.
-   Entity relationships are automatically resolved when selected from state.
-   Generic entity cache which means it's extensible to support other transport protocols or other formats.

## Usage

### Making an API request and mapping the request to component state

In this container example we create a dispatch action that makes an API request to the current_user endpoint and defined the `dataKey` currentUser to reference it. Then we select the `dataKey` which maps the result into our container state.

```javascript
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { actions, selectData, selectRequest } from 'libs/nion'
import { buildUrl } from 'utilities/json-api'

import Page from '../components/Page'

const dataKey = 'currentUser'

const mapStateToProps = createStructuredSelector(
    currentUser: selectData(dataKey),
    currentUserRequest: selectRequest(dataKey)
)

const mapDispatchToProps = dispatch => {
    return {
        getCurrentUser: () => {
            dispatch(actions.get(dataKey , {
                endpoint: buildUrl(
                    'current_user',
                    {
                        include: [],
                        fields: {}
                    }
                )
            }))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Page)
```

In the example above it's important to understand the `dataKey` interface. Not only are `dataKeys` used to link data internally across reducers. They give context to requests such as `currentUser`. Any component that now need this request data may select the `currentUser` key. This allows us to define higher level meaning to our requests in a dynamic way. Furthermore, if a component selects `dataKey` that was already fetched, or is fetching, we will return the same result without making additional network calls (unless we force it).

### How to initialize nion

In your application you may use `configureStore()` which is a convenience function to enable our middleware. the `nion` option defaults to `true` in `configureStore()`. Underneath all that is happening is we are adding a top level `nion` reducer to our state tree.

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import configureStore from 'shared/configure-store'
import ReactWrapper from 'components/ReactWrapper'
import AppContainer from './containers/AppContainer'

const store = configureStore({})

ReactDOM.render(
    <ReactWrapper>
        <Provider store={store}>
            <AppContainer />
        </Provider>
    </ReactWrapper>,
    document.getElementById('reactTarget'),
)
```

## Core details

### Actions

Interface for making API requests. The `actions` object exposes each action to make api requests. More information outlined below in API reference section.

### Reducers

nion can be broken down to 3 reducers: `entities`, `references`, and `requests`. Breaking the reducers down, entities is the model cache which is a object keyed by the model type and ID. Models across all requests are normalized and stored within the entities reducer. The references reducer maps the top level request information along with the top level entity or entities. Finally, requests holds lifecycle information of a given API request including any error information.

### Normalizers / Denormalizers

Entities that are stored must be normalized into the entity cache. Once a json-api response is successfully returned we parse out all included entities and meta information before it is dispatched. Reciprocally when selectData is called the entity hierarchy is denormalized making consumption in your components much nicer.

If you're curious, this is what the raw json-api payload looks like for the request. If you're curious about the schema, you may read more at [json api](http://jsonapi.org/).

## API reference

#### Making api requests

`actions.get(dataKey, {endpoint})`

`actions.post(dataKey, {endpoint, body={}})`

`actions.patch(dataKey, {endpoint, body={}})`

`actions.delete(dataKey, {endpoint})`

`dataKey`: binds the request and entities together and is used to map the request data back to state.

`endpoint`: is the relative path string of the endpoint you want to request. It is recommended that you use `buildUrl` to specify `include` and `fields` query params.

`body`: is an object which is the payload of your request to the server.

#### Building a json-api url

`buildUrl(pathname, {include=[], fields={}, ...queryParams})`

`include`: is a list allows you to specify any entity relationships that should be included in the request.

`fields`: is an object that allows you to explicitly define which entity attributes you would want included in the request.

`...queryParams`: any other query params you want included in the endpoint.

#### low-level api request

`actions.request(dataKey, request)`
This function allows you to define the raw API request data.

## Selectors

`selectData(dataKey)`

The `selectData` selector is extremely versatile, and is the best tool for selecting nion data off of the redux state tree. It exposes a syntax identical to `lodash.get`, meaning it can access any data denormalized from a `dataKey` or any subproperty of the denormalized object.

Example of selecting data and mapping to state props.

```javascript
const mapStateToProps = createStructuredSelector(
    currentUser: selectData('currentUser'),
    currentCreatorId: selectData('currentCreator.id'),
)
```
