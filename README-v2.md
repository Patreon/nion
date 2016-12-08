# nion




# @nion decorator
The nion decorator aims to handle all of the redux boilerplate of wiring up nion action creators and selectors to a given component. This allows for a simple, declarative interface where component's data management needs are managed in a clean, predictable way.

## A basic example
```javascript
@nion({
    currentUser: {
        endpoint: '/current_user',
    }
})
class UserContainer extends Component {
    render() {
        const { currentUser } = this.props.nion
        const { request, actions } = currentUser

        const loadButton = <Button onClick={() => actions.get()}>Load</Button>

        return (
            <Card>
                { request.isLoading ? <LoadingSpinner /> : loadButton }
                { exists(currentUser) ? <UserCard user={currentUser} /> : null }
            </Card>
        )
    }
}
```
The above example is a fully functional nion-wrapped component. Let's begin by looking at the nion decorator function, which wraps the child component in logic to create nion action creators and selectors, injecting the results in as props. The nion decorator takes a map of declaratives - objects that declare what the data requirements of a component are and how they'll be managed.

The keys of the map correspond to the `dataKeys` that will be tied to the component. Recall that the `dataKey` is the key on the redux state tree on which references to the normalized data and the corresponding network request status is stored. So, in the above example, the `dataKey` is `currentUser`. The second piece of interest is the `endpoint` property. This tells nion what API endpoint to fetch the data from. `endpoint` can be either a pathname snippet (which will be automatically converted to a full url), or a fully-formed JSON-API url, including options such as `include` and `fields`.

The nion decorator passes in a `nion` prop, with keys corresponding to the keys of the supplied declaratives - This means that the above example passes in a `nion` property with the shape `{ currentUser : {...} }`, which we'll call a `dataProp`. The `dataProp` is an object representation of the fully-denormalized data corresponding to that `dataKey`, along with some special hidden properties - `request` and `actions`. `request` is an object containing all of the current network request information for that `dataKey`, and `actions` is an object containing all four REST method action creators (`get`, `post`, `patch`, and `delete`). This means that all relevant information and methods for managing data are passed in under the namespace of the `dataProp`. If all this seems like a mouthful, let's take a quick look at what the `currentUser` `dataProp` looks like in the example above (after the data's been fetched, of course):

```javascript
{
    currentUser: {
        id: 12345,
        type: 'user',
        // ...denormalized attributes,
        request: { // non-enumerable (private)
            fetchedAt: 1481318710790
            isError: false
            isLoaded: true
            isLoading: false
            status: 'success'
        }, // non-enumerable (private)
        actions: {
            get: () => {...},
            post: () => {...},
            ...,
        }
    }
}
```

One final detail, that's important to keep in mind - Since data that hasn't been fetched yet is denormalized to `null`, and we can't assign the `request` and `action` properties to a `null` value, nion passes in an empty object to represent `null` data. This means that simple truthy existence checks will not behave as expected (since `currentUser` in the example above is `{}` when the underlying data doesn't exist). Fortunately, `nion` exposes an `exists` helper function to check for existence of the underlying data.

```javascript
// Before `currentUser` is loaded
const { currentUser } = this.props.nion

!!currentUser // true - remember, null values are passed in as {}
!!currentUser.id // false - the empty object has no id or type
!!currentUser.request // true - the empty object does have private request...
!!currentUser.actions // true - and actions objects
exists(currentUser) // false - nion exposes a useful existence check method
```

Even from this basic example, nion is doing a lot under the hood. But remember, it's all just redux - the nion decorator is simply taking care of all of the necessary redux boilerplate: connecting to the redux store, selecting data, creating and action dispatchers, and passing these into the child component as props. The denormalized object on the `dataProp` is just the result of `selectData(<dataKey>)`, the `request` object is the result of `selectRequest(<dataKey)`, and the `actions` object is a collection of curried nion action creators for each REST request type.

Using the nion decorator leads to a cleaner, simpler, more consistent, and more predictable interface with the underlying redux code.

## Data from props
```javascript
@nion(({ userId }) => ({
    user: {
        dataKey: `user:${userId}`,
        endpoint: `/users/${userId}`,
    }
}))
class UserContainer extends Component {
    render() {
        const { user } = this.props.nion
        const { request, actions } = user

        const loadButton = <Button onClick={() => actions.get()}>Load</Button>

        return (
            <Card>
                { request.isLoading ? <LoadingSpinner /> : loadButton }
                { exists(user) ? <UserCard user={user} /> : null }
            </Card>
        )
    }
}
```
An extremely common pattern for managing data is fetching data from an endpoint that we don't know ahead of time, or that's dependent on data provided to the child component. The nion decorator, in place of a map of declaratives, can also accept a function that takes in props and returns a map of declaratives. In this way, we can manage data that's dependent on parent data clearly and concisely.

There are a few things to note about the example above - First, we're passing in a prop `userId` into the nion decorator from the parent component. This prop is used by the nion decorator to create the declarative which determines how this component's data will be managed. In order to manage this data correctly, we have to create both an `endpoint` corresponding to the passed in `userId`, as well as a new `dataKey` specific to the current user being managed. In the first example, the `dataKey` corresponds to the key of the provided declarative, but this can be overridden by creating a custom `dataKey` property when building the declarative. Remember, the `dataKey` is the key on the redux state tree where the data and corresponding request will be managed, so it needs to be unique to the user data being managed. We'll use the convention `<type>:<id>` moving forward, but this can be any unique identifier for the given resource.

Conveniently, the nion decorator passes in the `dataProp` under the key of the declarative, so the component will access all data under the key `user`, even though the underlying data is attached to the redux state tree as `user:<userId>`.

## Include / Fields
```javascript
@nion({
    currentUser: {
        endpoint: buildUrl('/current_user', {
            include: ['campaign'],
            fields: {
                user: ['full_name'],
                campaign: ['name']
            }
        })
    }
})
class UserContainer extends Component { ... }
```
Since JSON-API allows for us to manually request included fields and relationships, a nion declarative can use a fully formed JSON API url as its `endpoint` property. nion exposes a `buildUrl` utility function for creating fully-formed JSON-API urls, with all relevant query-string options provided as a second `options` parameter. In the previous examples, we provide just the shorthand pathname to the `endpoint` property - This is a convenience, since nion uses `buildUrl` under the hood to construct a fully-formed JSON-API url.

Note that since the declarative can also be constructed as a function of the passed-in props, we can easily add in dynamic query string parameters to our endpoint as well.

```javascript
@nion(({ filterType }) => ({
    stream: {
        dataKey: `stream:filter:${filterType}`
        endpoint: buildUrl('/stream', {
            filter: filterType
        })
    }
}))
class StreamContainer extends Component { ... }
```

## Component Lifecycle
```javascript
@nion({
    currentUser: {
        endpoint: '/current_user',
        onMount: true,
        once: true
    }
})
class UserContainer extends Component {
    render() {
        const { currentUser } = this.props.nion
        const { request } = currentUser

        return (
            <Card>
                { request.isLoading ? <LoadingSpinner /> : null }
                { exists(currentUser) ? <UserCard user={currentUser} /> : null }
            </Card>
        )
    }
}
```
Another extremely common pattern is for a component to begin loading data as soon as it's mounted. This can be achieved very easily by invoking the `get` method for a given `dataProp` in the component's `componentDidMount` method, but the nion decorator provides a few handy lifecyle options to manage this automatically. The `onMount` option tells the nion decorator to automatically dispatch a `get` action when the component mounts, and the `once` option ensures that `nion` only loads this data once, not every time the component is mounted. Note the default value of `once` is `true`, it's only explicitly passed in in the above example for clarity's sake.

## Patching
```javascript
@nion({
    currentUser: {
        endpoint: '/current_user',
    }
})
class UserContainer extends Component {
    render() {
        const { currentUser } = this.props.nion
        const { request, actions } = currentUser

        const updateUser = () => {
            actions.patch({
                name: ''
            })
        }

        const updateButton = <Button onClick={updateUser} />Patch</Button>

        return (
            <Card>
                { request.isLoading ? <LoadingSpinner /> : updateButton }
                { exists(currentUser) ? <UserCard user={currentUser} /> : null }
            </Card>
        )
    }
}
```
The nion decorator exposes all four REST method nion action functions to the child component under the `dataProp` namespace. The `patch` method (which corresponds to the `PUT` or `PATCH` REST method), is the most common mutative operation.

The method signature for the `patch` method is `patch(data)`.  Conveniently, all nion actions passed in through the nion decorator return promises that are either resolved on API request success or rejected on failure - this allows for contingent handling of the success or error state in a bit more practical way than hooking into custom reducers.

#### TODO - The current implementation of nion does not do optimistic mutations by default. We're going to investigate whether or not this is good behavior by default.

## Posting / Deleting
```javascript
@nion(({ commentId }) => ({
    commentLike: {
        dataKey: `commentLike:${commentId}`,
        endpoint: `/comments/${commentId}/like`
    }
}))
class CommentLikeContainer extends Component {    
    render() {
        const { commentLike } = this.props.nion

        const likeComment = () => commentLike.actions.post()
            .then(() => {
                // Do something contingent on POST success
            })
            .catch(() => {
                // Do something contingent on POST error
            })

        const unlikeComment = () => commentLike.actions.delete({
            id: commentLike.id,
            type: 'like'
        })

        const likeButton = <Button onClick={likeComment} />Like</Button>
        const unlikeButton = <Button onClick={unlikeComment} />Unlike</Button>

        const button = exists(commentLike) ? unlikeButton : likeButton

        return (
            <Card>
                { commentLike.request.isLoading ? <LoadingSpinner /> : button }
            </Card>
        )
    }
}
```
The nion decorator exposes all four REST method nion action functions to the child component under the `dataProp` namespace. The `patch` method (which corresponds to the `PUT` or `PATCH` REST method), is the most common mutative operation.

The method signature for the `patch` method is `patch(data)`.  Conveniently, all nion actions passed in through the nion decorator return promises that are either resolved on API request success or rejected on failure - this allows for contingent handling of the success or error state in a bit more practical way than hooking into custom reducers.

#### TODO - I'm not sure if we need to pass in the `ref` to be deleted in the DELETE function exposed through the nion decorator. This can probably be auto-curried, especially now that we're denormalizing a `_ref` property onto the data.


```javascript
@nion(({ commentId }) => ({
    commentLike: {
        dataKey: `commentLike:${commentId}`,
        endpoint: `/comments/${commentId}/like`
    }
}))
class CommentLikeContainer extends Component {    
    render() {
        const { commentLike, updateEntity } = this.props.nion
        const { comment } = this.props // The parent comment

        const commentRef = { id: comment.id, type: 'comment' }

        const likeComment = () => updateEntity(commentRef, {
                likeCount: comment.likeCount + 1,
                currentUserHasLiked: true
            })
            .then(() => commentLike.actions.post())

        const unlikeComment = () => updateEntity(commentRef, {
                likeCount: comment.likeCount - 1,
                currentUserHasLiked: false
            })
            .then(() => commentLike.actions.delete())

        const likeButton = <Button onClick={likeComment} />Like</Button>
        const unlikeButton = <Button onClick={unlikeComment} />Unlike</Button>

        const canLikeComment = !exists(commentLike) && !comment.currentUserHasLiked
        const button = canLikeComment ? likeButton : unlikeButton

        return (
            <Card>
                { commentLike.request.isLoading ? <LoadingSpinner /> : button }
            </Card>
        )
    }
}
```
