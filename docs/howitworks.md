# How Nion Works

nion significantly reduces the complexity of managing data by both abstracting away all of the logic and code needed to select data and handle requests, and by offering a clear and consistent pattern for doing so.

```javascript
@nion({
    currentUser: {
        endpoint: 'https://patreon.com/api/current_user',
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

### Entities
The entities reducer keeps a **normalized** map of all given entities in the system, keyed by `type` and `id`. This means that all data is kept consistent regardless of where it's being accessed from.

### References
The references reducer maintains a map of `dataKeys` pointing to the corresponding entities (as an object with `type` and `id` fields).

### Requests
The requests reducer maintains a map of `dataKeys` that tracks all network request details around fetching / updating data.

Internally, the nion suite of redux tools handles everything necessary to maintain application state and provide a clear interface to the higher-level component tooling.
