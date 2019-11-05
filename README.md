# nion

nion is a library that makes it easy to fetch, update, and manage API data in a Redux store as well as bind it to React components. Nion strives to make working with data as **flexible**, **consistent**, and **predictable** as possible. 💖

nion is heavily inspired by [Apollo](http://www.apollodata.com/) and [GraphQL](http://graphql.org/).

## In a Nutshell 🌰

nion is used as a **hook** which is given a declaration of what data is needed by the component that calls it.

```javascript
import { exists, useNion } from 'nion'

export const UserContainer = () => {
    const [currentUser, actions, request] = useNion({
        dataKey: 'currentUser',
        endpoint: 'https://patreon.com/api/current_user',
    })

    const loadButton = <Button onClick={() => actions.get()}>Load</Button>

    return (
        <Card>
            {request.isLoading ? <LoadingSpinner /> : loadButton}
            {exists(currentUser) ? <UserCard user={data} /> : null}
        </Card>
    )
}
```

We simply pass in a [`declaration`](docs/glossary.md#declaration) object that tells nion **what** to fetch, and nion automatically handles fetching the data and returning it along with the corresponding request status.

nion can also be used as a **decorator function** which declares what data will be managed by the decorated component and passes in props for managing that data. This is a deprecated usage; we don't recommend writing new code that uses the decorator form.

See also:

-   [Examples](docs/examples.md), a list of common scenarios when using nion
-   [How nion works](docs/howitworks.md), a deep dive

## Up and Running 🏃🏾‍♀️

### Installation

nion requires `redux-thunk` in order to handle its async actions, so you should install that along with the `nion` package.

```
npm install nion redux-thunk --save
```

Also, nion is best used as a decorator function, so you might also want to make sure you've got babel configured to handle decorator transpilation:

```
npm install babel-plugin-transform-decorators-legacy --save-dev
```

### Configuration

Finally, nion has to be wired up to the redux store and optionally configured. Here's a very simple setup:

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

[Read more about configuring nion in the docs.](docs/configuration.md)

## Read More 📚

-   [Declarations](docs/declarations.md)
-   [Configuring Nion](docs/configuration.md)
-   [API Modules](docs/api-modules.md)
-   [Extensions](docs/extensions.md)
-   [Glossary](docs/glossary.md)
-   [How it Works](docs/howitworks.md)
-   Lifecycle (documentation coming soon 😳)

## Licensing 🍴

[MIT](license.txt)
