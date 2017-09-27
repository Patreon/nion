# nion

Redux is awesome. It's an extremely elegant solution to the central problem facing frontend web developers - how to manage complex application state. However, there are two fundamental issues with redux that have made themselves more and more apparent as both applications and development teams grow.

##### Problem 1: Data Fetching
Data Fetching is hard. Managing network requests and the data that comes back is hard enough, but doing it using redux can be downright maddening. This is because redux, at it's core, is a system that relies on **pure functions** - functions that always return the same thing given the same input. By their very nature, network requests are **impure** - they can return errors, for instance. In order to accommodate these **side effects**, the redux ecosystem has come up with a [number](https://github.com/agraboso/redux-api-middleware) of [solutions](https://github.com/yelouafi/redux-saga). However, using these tools can be anything but straightforward due to tricky syntax, complexity, and lack of community consensus.

##### Problem 2: Conventions / Patterns
Since redux is so low level, much of an app's redux implementation is left up to the developer. While certain practices have become *de rigeur*, there really isn't anything close to an opinionated framework that developers can use as a guide. Because of this, setting and enforcing code conventions and patterns become **extremely** important as an application and team grows.

### Thus, nion
nion is our best attempt at addressing the main issues that come with developing a complex redux web application. It's an **opinionated** solution to the problems we faced building a React web application **at Patreon**. nion was designed with the specific purpose of making the development experience **predictable**, **clear**, and **consistent**. nion always emphasizes the pragmatic solution over the theoretical, and aims to expose the minimum surface area possible to the developer. In short, nion aims to **simplify** the process of managing data in a React app.

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
                { exists(currentUser.data) ? <UserCard user={currentUser.data} /> : null }
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

##### nion flow chart

![nion flow chart](docs/nion%20decorator.png)

Reference-style:

### Learn More

[examples](docs/examples.md)

[deep dive](docs/deep-dive.md)

[api](docs/api.md)

[nion-core](docs/core.md)

[definitions](docs/definitions.md)
