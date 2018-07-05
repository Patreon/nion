# nion

nion is a library that makes it easy to fetch, update, and manage API data in a Redux store as well as bind it to React components. Nion strives to make working with data as **flexible**, **consistent**, and **predictable** as possible. :heart:

nion is heavily inspired by [Apollo](http://www.apollodata.com/http://www.apollodata.com/) and [GraphQL](http://graphql.org/).

## How it works

nion is best used as a **decorator function** which declares what data will be managed by the decorated component and passes in props for managing that data.

```javascript
@nion({
    currentUser: {
        endpoint: buildUrl('/current_user'),
    }
})
class UserContainer extends Component {
    render() {
        const { currentUser } = this.props.nion
        const { request, actions, data } = currentUser

        const loadButton = <Button onClick={() => actions.get()}>Load</Button>

        return (
            <Card>
                { request.isLoading ? <LoadingSpinner /> : loadButton }
                { exists(currentUser) ? <UserCard user={data} /> : null }
            </Card>
        )
    }
}
```

We simply pass in an object with a special `declaration` that tells nion **what** to fetch, and nion automatically handles fetching the data and passing both it and the corresponding request status in as props to the decorated component.

nion significantly reduces the complexity of managing data by both abstracting away all of the logic and code needed to select data and handle requests, and by offering a clear and consistent pattern for doing so. As we'll see later, nion offers simple solutions for nearly every type of common application scenario, including component/request lifecycles, updates, multiple requests, and pagination.

The central component to understanding nion is the `dataKey`. In the above example, the `dataKey` is `"currentUser"`. The `dataKey` is the address on the state tree with which nion manages a given resource. A resource is composed of both the underlying data and corresponding network request status for a given piece of application state.

Let's take a look at what the corresponding redux state tree  looks like (after the data has been fetched) to better understand what nion is doing under the hood.

```javascript
nion: {
    entities: {
        user: {
            '3803025': {
                attributes: {...},
                relationships: {},
            }
        }
    },
    references: {
        currentUser: {
            entities: [{
                type: 'user',
                id: '3803025'
            }],
            isCollection: false,
    },
        requests: {
            currentUser: {
                fetchedAt: 1480617638990,
                isError: false,
                isLoaded: true,
                isLoading: false,
                status: 'success',
            }
        }
    }
}
```

nion manages three internal reducers that handle data fetching and management across the application:

##### Entities
The entities reducer keeps a **normalized** map of all given entities in the system, keyed by `type` and `id`. This means that all data is kept consistent regardless of where it's being accessed from.

##### References
The references reducer maintains a map of `dataKeys` pointing to the corresponding entities (as an object with `type` and `id` fields).

##### Requests
The requests reducer maintains a map of `dataKeys` that tracks all network request details around fetching / updating data.

Internally, the nion suite of redux tools handles everything necessary to maintain application state and provide a clear interface to the higher-level component tooling.

## Getting started

nion requires `redux-thunk` in order to handle its async actions, so you should install that along with the `nion` package.

```
npm install nion redux-thunk --save
```

Also, nion is best used as a decorator function, so you might also want to make sure you've got babel configured to handle decorator transpilation:

```
npm install babel-plugin-transform-decorators-legacy --save-dev
```

Finally, nion has to be wired up to the redux store and optionally configured. Here's a very simple setup:

```
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
