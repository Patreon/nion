# nion examples


## A basic example
```javascript
@nion({
    currentUser: {
        endpoint: buildUrl('/current_user'),
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
                { exists(currentUser.data) ? <UserCard user={currentUser.data} /> : null }
            </Card>
        )
    }
}
```
The above example is a fully functional nion-wrapped component. Let's begin by looking at the nion decorator function, which wraps the child component in logic to create nion action creators and selectors, injecting the results in as props. The nion decorator takes a map of declarations - objects that declare what the data requirements of a component are and how they'll be managed.

The keys of the map correspond to the `dataKeys` that will be tied to the component. Recall that the `dataKey` is the key on the redux state tree on which references to the normalized data and the corresponding network request status is stored. So, in the above example, the `dataKey` is `currentUser`. The second piece of interest is the `endpoint` property. This tells nion what API endpoint to fetch the data from. `endpoint` can be either a pathname snippet (which will be automatically converted to a full url), or a fully-formed JSON-API url, including options such as `include` and `fields`.

The nion decorator passes in a `nion` prop, with keys corresponding to the keys of the supplied declarations - This means that the above example passes in a `nion` property with the shape `{ currentUser : {...} }`, which we'll call a `dataProp`. The `dataProp` contains a `data` attribute, which is an object representation of the fully-denormalized data corresponding to that `dataKey`, along with `request` and `actions` attributes. `request` is an object containing all of the current network request information for that `dataKey`, and `actions` is an object containing all four REST method action creators (`get`, `post`, `patch`, and `delete`). This means that all relevant information and methods for managing data are passed in under the namespace of the `dataProp`. If all this seems like a mouthful, let's take a quick look at what the `currentUser` `dataProp` looks like in the example above (after the data's been fetched, of course):

```javascript
{
    currentUser: {
        data: {
            id: 12345,
            type: 'user',
            // ...denormalized attributes,
        },
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

Even from this basic example, nion is doing a lot under the hood. But remember, it's all just redux - the nion decorator is simply taking care of all of the necessary redux boilerplate: connecting to the redux store, selecting data, creating and action dispatchers, and passing these into the child component as props. The denormalized object on the `dataProp` is just the result of `selectData(<dataKey>)`, the `request` object is the result of `selectRequest(<dataKey)`, and the `actions` object is a collection of curried nion action creators for each REST request type.

Using the nion decorator leads to a cleaner, simpler, more consistent, and more predictable interface with the underlying redux code.

## Data from props
```javascript
@nion(({ userId }) => ({
    user: {
        dataKey: `user:${userId}`,
        endpoint: buildUrl(`/users/${userId}`),
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
                { exists(user.data) ? <UserCard user={user.data} /> : null }
            </Card>
        )
    }
}
```
An extremely common pattern for managing data is fetching data from an endpoint that we don't know ahead of time, or that's dependent on data provided to the child component. The nion decorator, in place of a map of declarations, can also accept a function that takes in props and returns a map of declarations. In this way, we can manage data that's dependent on parent data clearly and concisely.

There are a few things to note about the example above - First, we're passing in a prop `userId` into the nion decorator from the parent component. This prop is used by the nion decorator to create the declaration which determines how this component's data will be managed. In order to manage this data correctly, we have to create both an `endpoint` corresponding to the passed in `userId`, as well as a new `dataKey` specific to the current user being managed. In the first example, the `dataKey` corresponds to the key of the provided declaration, but this can be overridden by creating a custom `dataKey` property when building the declaration. Remember, the `dataKey` is the key on the redux state tree where the data and corresponding request will be managed, so it needs to be unique to the user data being managed. We'll use the convention `<type>:<id>` moving forward, but this can be any unique identifier for the given resource.

Conveniently, the nion decorator passes in the `dataProp` under the key of the declaration, so the component will access all data under the key `user`, even though the underlying data is attached to the redux state tree as `user:<userId>`.

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
Since JSON-API allows for us to manually request included fields and relationships, a nion declaration can use a fully formed JSON API url as its `endpoint` property. nion exposes a `buildUrl` utility function for creating fully-formed JSON-API urls, with all relevant query-string options provided as a second `options` parameter.

Note that since the declaration can also be constructed as a function of the passed-in props, we can easily add in dynamic query string parameters to our endpoint as well.

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

## Component Lifecycle - Loading on mount
```javascript
@nion({
    currentUser: {
        endpoint: buildUrl('/current_user'),
        fetchOnInit: true,
        fetchOnce: true
    }
})
class UserContainer extends Component {
    render() {
        const { currentUser } = this.props.nion
        const { request } = currentUser

        return (
            <Card>
                { request.isLoading ? <LoadingSpinner /> : null }
                { exists(currentUser.data) ? <UserCard user={currentUser.data} /> : null }
            </Card>
        )
    }
}
```
Another extremely common pattern is for a component to begin loading data as soon as it's mounted. This can be achieved very easily by invoking the `get` method for a given `dataProp` in the component's `componentDidMount` method, but the nion decorator provides a few handy lifecyle options to manage this automatically. The `fetchOnInit` option tells the nion decorator to automatically dispatch a `get` action when the component mounts, and the `fetchOnce` option ensures that `nion` only loads this data once, not every time the component is mounted. Note the default value of `fetchOnce` is `true`, it's only explicitly passed in in the above example for clarity's sake.

## Component Lifecycle - Loading when props change
```javascript
// Child Component
@nion(({ userId }){
    user: {
        endpoint: buildUrl(`/user/${userId}`),
        fetchOnInit: true
    }
})
class UserContainer extends Component {
    render() {
        const { user } = this.props.nion
        const { request } = currentUser

        return (
            <Card>
                { request.isLoading ? <LoadingSpinner /> : null }
                { exists(currentUser.data) ? <UserCard user={currentUser.data} /> : null }
            </Card>
        )
    }
}
```
In the above example, when we pass a different `userId` prop into the nion-wrapped component, the component will automatically load the data corresponding to the new dataKey. This is because the `fetchOnInit` parameter *actually* instructs nion to automatically fetch data when a new dataKey is instantiated (which can occur as result of either mounting a component for the first time, or passing different props into the wrapped component).

## Patching
```javascript
@nion({
    currentUser: {
        endpoint: buildUrl('/current_user'),
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
                { exists(currentUser.data) ? <UserCard user={currentUser.data} /> : null }
            </Card>
        )
    }
}
```
The nion decorator exposes all four REST method nion action functions to the child component under the `dataProp` namespace. The `patch` method (which corresponds to the `PUT` or `PATCH` REST method), is the most common mutative operation.

The method signature for the `patch` method is `patch(data)`.  Conveniently, all nion actions passed in through the nion decorator return promises that are either resolved on API request success or rejected on failure - this allows for contingent handling of the success or error state in a bit more practical way than hooking into custom reducers.

## Posting / Deleting
```javascript
@nion(({ commentId }) => ({
    commentLike: {
        dataKey: `commentLike:${commentId}`,
        endpoint: buildUrl(`/comments/${commentId}/like`)
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

        const button = exists(commentLike.data) ? unlikeButton : likeButton

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

## Optimistic Updates

At the moment, nion's mutative methods are **not** optimistic by default. However, the nion decorator exposes a simple, general-purpose tool for mutating any underlying entity data that's useful for accomplishing optimistic updates. Let's revisit the above example, with a bit more logic in place for handling `likes` in a more real-life fashion.

```javascript
@nion(({ commentId }) => ({
    commentLike: {
        dataKey: `commentLike:${commentId}`,
        endpoint: buildUrl(`/comments/${commentId}/like`)
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

        const canLikeComment = !exists(commentLike.data) && !comment.currentUserHasLiked
        const button = canLikeComment ? likeButton : unlikeButton        

        return (
            <Card>
                { commentLike.request.isLoading ? <LoadingSpinner /> : button }
            </Card>
        )
    }
}
```

In the above example, as is the case in Patreon's real-life code, the display logic for rendering comment likes is actually a product of data stored on the **comment** itself, not the presence or absence of a corresponding like resource. This information is represented by two props on the `comment` - `likeCount` and `currentUserHasLiked`. In order to display the information indicating the intended action to the user as quickly as possible, we need to optimistically update the data corresponding to the render logic - in this case, updating the parent comment's `likeCount` and `currentUserHasLiked` properties. We do this with the `updateEntity` nion method, which is passed in as a top-level method of the `nion` prop by the nion decorator. This method takes a `ref` (`{id, type}` tuple pointer) as the first argument, and an object of attributes to be updated on the corresponding entity.

The `updateEntity` nion action is extremely simple under the hood - it simply merges the passed in attributes object into the attributes of the relevant entity. At this time, it's not present to do more advanced updates to a given entity, such as changing the relationships, deleting, or creating new entities.

In addition, since the `updateEntity` method returns a promise, we can chain it with nion REST actions to handle success / failure of network actions in a clear an concise manner. For instance, if we wanted to undo our optimistic update upon network failure, we would do the following:

```javascript
const likeComment = () => updateEntity(commentRef, {
        likeCount: comment.likeCount + 1,
        currentUserHasLiked: true
    })
    .then(() => commentLike.actions.post())
    .catch(() => updateEntity(commentRef, {
            likeCount: comment.likeCount,
            currentUserHasLiked: false
        })
    })
```

> A note on optimistic POST and DELETE: So far, we haven't developed the solution for optimistically creating or removing an entity - Since this is a fairly uncommon use case, and may overlap with a  more general optimistic mutation strategy, we're waiting to implement it until we know a bit more about the corresponding use cases.

## Pagination

Since our JSON-API interface uses a simple, cursor-based pagination system across API resources, the nion decorator can handle pagination in a consistent and elegant way.

```javascript
@nion({
    stream: {
        endpoint: buildUrl(`/stream`),
        paginated: true,
        fetchOnInit: true
    }
})
class Paginated extends Component {
    render() {
        const { stream } = this.props.nion

        const { loading, canLoadMore } = stream.request.isLoading
        const fetchNext = stream.actions.next

        return (
            <Card>
                { exists(stream.data) ? <Stream stream={stream.data} /> : null }
                { loading ? <LoadingSpinner /> : null }
                { canLoadMore ? <Button onClick={fetchNext}>Load More</Button> : null }
            </Card>
        )
    }
}
```

Paginated resources are managed by simply passing in the parameter `paginated: true` into the declaration, which tells the nion decorator to expose a few pagination-related properties to the child component. The main focus is the `next` action method, which is simply a `get` action method curried with the next page cursor returned from the initial request to the paginated resource's endpoint. In addition to dispatching this curried `get` request, the `next` method also dispatches the underlying `JSON_API_SUCCESS` redux action with a special `isNextPage` meta property, which tells the internal reducers to append the result of the `next` request to the existing `reference` rather than overwriting it.

In addition to the `next` action method, the nion decorator also exposes a `canLoadMore` property to the `request` property - This is a convenience property indicating whether or not a `next` link  exists on the given ref's links object.

If for some reason it were to become necessary to manually override the behavior of the `next` action, we can pass in a `params` object into the action to override any JSON-API url params we wish. This is the case with all nion actions exposed through the nion decorator.

## Creating refs from data (Parent / Child management)

A common, but more advanced, use case in data management is the creation of new refs to be managed by parent components. In the case of a stream or post feed, we may fetch a list of posts from the `/stream`, but subsequently use nion to manage data involving individual posts in the stream (for instance, loading their comments). This overlap of responsibilities from parent to child is a fairly common use case for more complex web applications, and presents a number of technical challenges.

nion provides an elegant solution for handling the above use case. In earlier examples, we've learned how to create a `dataKey` per-component. Recall that this `dataKey` is the key on which the underlying `reference` and `request` is managed on the nion state. However, when the new `dataKey` is created and the `reference` is initialized, the actual pointer to the underlying data will be empty since nion will not yet have loaded any data under that `dataKey`.

If the data that is to be managed by the child component already exists, we'll need some way to initialize this new `reference` under the supplied `dataKey` with that existing data. We do this by providing the child component with an initial ref using the `initialRef` property of the declaration. Let's take a look at this in code.

```javascript
// The parent Stream container
@nion({
    stream: {
        endpoint: buildUrl(`/stream`),
        fetchOnInit: true
    }
})
class Stream extends Component {  
    render() {
        const { stream } = this.props.nion
        const loading = stream.request.isLoading

        return (
            <Card>
              { loading ? <LoadingSpinner /> : stream.data.map(post =>
                  <Post post={post} />
              )}
            </Card>
        )
    }
}
```
```javascript
// The child Post container
@nion(({ post }) => ({
    post: {
        dataKey: `post:${post.id}`,
        endpoint: buildUrl(`/posts/${post.id}`),
        initialRef: makeRef(post)
    }
}))
class Post extends Component {  
    render() {
        const { post } = this.props.nion
        const loading = post.request.isLoading

        const reloadButton = <Button onClick={post.actions.get}>Reload</Button>

        return (
            <Card>
              <PostCard post={post.data} />
              { loading ? <LoadingSpinner /> : reloadButton }
            </Card>
        )
    }
}
```

In the example above, we're providing the child component with an **initial ref** via the `initialRef` declaration property, which will automatically be inserted into the `references` state. This allows us to seamlessly pass responsiblity of managing a given piece of data to the child component. Let's take a quick look at the redux store to see exactly what's going on here

```javascript
{
    nion: {
        entities: {...},
        requests: {...},
        references: {
            stream: {
                data: [{
                   id: '1234',
                   type: 'post'
                }, {
                    id: '5678',
                    type: 'post'
                }],
            },
            'post:1234': {
                data: {
                    id: '1234',
                    type: 'post'
                }
            },
            'post:5678': {
                data: {
                    id: '5678',
                  type: 'post'
                }
            }
        }
    }
}
```

Notice that the `references` have been automatically populated with their given `refs`, or pointers to the underlying entities - now the `reference` corresponding to the given dataKey has all of the information necessary to manage the data for a given post. It's almost as if we're "preloading" the references with pointers to the corresponding data.

We use the `makeRef` function to provide an initial ref to the declaration - In order for nion to attach a ref to the state tree we need to create a ref in the shape that nion expects - The most basic function of `makeRef` is to transform the input data by selecting off the `id` and `type` parameters to construct a ref. However, there's some extremely useful functionality baked into the `makeRef` function that allows us to handle much more complex use cases.

Let's take this a step further to understand how we'd manage the corresponding comments for each post, which could themselves be paginated. First, let's look at the nion state tree for this situation, in order to understand what's happening at the data level.

```javascript
{
    nion: {
        entities: {
            post: {
                1234: {
                    attributes: {...},
                    relationships: {
                        recentComments: {
                            data: [{
                                type: 'comment',
                                id: '8901'
                            }, {
                                type: 'comment',
                                id: '8902'
                            }],
                            links: {
                                next: '....nextUrl',
                            }
                        }
                    }
                }
            },
            comment: {...}
        },
        requests: {...},
        references: {...}
    }
}
```

Notice that our post has a relationship to `recentComments`, of which the first two are fetched automatically when loaded from the `/stream` endpoint. These comments are paginated, and if we want to manage this `comments` data with a child component of our Post component, we're going to have to initialize a ref with both the relevant `{id, type}` information as well as the relevant pagination information.

Fortunately, nion exposes a simple interface for handling this fairly complex operation through the makeRef function.

```javascript
// The grandchild Comments container
@nion(({ post }) => ({
    comments: {
        dataKey: `postComments:${post.id}`,
        initialRef: makeRef(post.recentComments),
        paginated: true
    }
}))
class CommentsContainer extends Component {  
    render() {
        const { comments } = this.props.nion
        const { loading, canLoadMore } = comments.request

        const loadMoreButton = <Button onClick={comments.actions.next}>Load More</Button>
        const showLoadMore = () => canLoadMore ? loadMoreButton : null  

        return (
            <Card>
                { exists(comments.data) ? <CommentsList comments={comments.data} /> : null }
                { loading ? <LoadingSpinner /> : showLoadMore() }
            </Card>
        )
    }
}
```

By using the `makeRef` function, nion automatically attaches the relevant `links` (and `meta`) information for the `recentComments` entity relationship ref.  

```javascript
{
    nion: {
        entities: {
            post: {
                1234: {
                    attributes: {...},
                    relationships: {
                        recentComments: {
                            data: [{
                                type: 'comment',
                                id: '8901'
                            }, {
                                type: 'comment',
                                id: '8902'
                            }],
                            links: {
                                next: '....nextUrl',
                            }
                        }
                    }
                }
            },
            comment: {...}
        },
        requests: {...},
        references: {
            'comments:1234': {
                entities: [{
                    type: 'comment',
                    id: '8901'
                }, {
                    type: 'comment',
                    id: '8902'
                }],
                links: {
                    next: '....nextUrl',
                }
            }
            ...,
        }
    }
}
```

The nion decorator uses a selector called `selectData` under the hood to return the fully denormalized data for any given `dataKey`, and this denormalization process actually creates a hidden `_ref` property on every level of the denormalized object, which maintains the relevant ref on the data. So, for any data passed in as a `nion` dataProp, a pointer ref to the underlying data is automatically available to the `makeRef` function to use to create a `ref` to the underlying data, including all relevant links / meta information. This allows nion to seamlessly hand off management of data from one component to another.

If the above example seems complex, fear not! There's another set of docs called [**nion deep dive: building a stream**](./deep-dive.md) that attempts to explain in detail the entire process of building a fully-featured app, including these complex parent-child relationships, with nion.

## Manual nion redux

Although the nion decorator is the most semantic and straightforward way of managing nion data, it's really just a convenient way of wrapping components in the logic necessary to select data off of the nion state tree and create relevant actions. Since all of this is being done with a redux `connect` function under the hood, we can manually do all of the leg work ourselves if the use case demands it. An example:

```javascript
const dataKey = 'currentUserCampaign'

const mapStateToProps = createStructuredSelector({
    campaign: selectData(dataKey),
    campaignRequest: selectRequest(dataKey)
})

const mapDispatchToProps = (dispatch => ({
    getCampaign: (campaignId) => () => dispatch(jsonApi.get(
        dataKey,
        { endpoint: jsonApi.urlBuilder(`/campaigns/${campaignId}`) }
    ))
}))

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return {
        ...stateProps,
        ...dispatchProps,
        getCampaign: dispatchProps.getCampaign(ownProps.campaignId)
    }
}

@connect(mapStateToProps, mapDispatchToProps, mergeProps)
class CurrentUserCampaign extends Component {
  	componentDidMount() {
      this.props.getCampaign()
    }

    render() {
        const { campaign, campaignRequest } = this.props
        const { isLoading } = campaignRequest

        return (
            <Card>
                { isLoading ? <LoadingSpinner /> : <CampaignCard campaign={campaign} /> }
            </Card>
        )
    }
}
```

nion exports all of its internal selectors and action creators, which can be manually used in a redux `connect` function. In the above example, we're using `selectData` and `selectRequest` in `mapStateToProps` to select data attached to a supplied `dataKey` from the nion redux state. We then set up a dispatch method using the `jsonApi.get` action creator, passing it along to `mapDispatchToProps`. Finally, we curry the `getCampaign` dispatch method with the passed in prop `campaignId` to complete the functionality.

Remember, this is what the nion decorator is doing under the hood anyway, just with much more functionality exposed and using a more declarative syntax. If at any point the nion decorator proves too inflexible, then it's totally acceptable to use manual redux syntax to achieve the necessary functionality. It's even completely possible to use both together.
