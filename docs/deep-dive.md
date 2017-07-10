# nion deep dive

nion is our best attempt at addressing the main issues that come with developing a complex redux web application. It's an **opinionated** solution to the problems we face at Patreon.

A canonical example of a challenging data management problem is a **stream**. Our **stream** is a paginated list of posts, which can be liked and unliked, and have comments and replies, which are both also independently paginated. This presents a number of challenges that have guided the design process of nion.

1. How do I paginate a list?
1. How do I optimistically update data?
1. How do I pass off management of data from one component to another?
1. How do I do all of this while keeping my code clear?


<hr>


In the following walkthrough, we'll be building a fully functional stream using nion, thus learning how nion allows us to solve the problems involved in a clean and elegant way.

## table of contents

1. [a stream of posts](#1-a-stream-of-posts)
2. [loading data on mount](#2-loading-data-on-mount)
3. [include and fields](#3-include-and-fields)
4. [pagination](#4-pagination)
5. [render post details](#5-render-post-details)
6. [like a post](#6-like-posts)
7. [mutating data](#7-mutating-data)
8. [unlike a post](#8-unlike-a-post)
9. [mutating data optimistically](#9-mutating-data-optimistically)
10. [loading more comments](#10-loading-more-comments)
11. [loading replies](#11-loading-replies)


<hr>


## 1. a stream of posts

Let's begin by fetching and rendering a stream of posts. We begin by wrapping a **Stream** component with the nion decorator function. The nion decorator accepts a map of **declarations** as its parameters, which tell nion *what* data to manage and *where* to load it from. *What* data nion will manage is determined by the **dataKey**, and *where* it will load it from is determined by the endpoint.

In the example below, our **dataKey** is `"stream"`, and our **endpoint** is `"/stream"`. In this most basic case, the **dataKey** is determined by the key of the declaration passed into the nion decorator. The nion decorator creates a set of selectors and actions based on this information and passes the selected data and actions into the child component as props mapped to the key of the declarative.

#### Stream.jsx
```javascript
import React, { Component } from 'react'
import nion, { exists } from 'libs/nion'

import Post from './Post'

@nion({
    stream: {
        endpoint: '/stream'
    }
})
class Stream extends Component {
    componentDidMount() {
        const { stream } = this.props.nion
        stream.actions.get()
    }

    render() {
        const { stream } = this.props.nion
        const { isLoading } = stream.request

        return (
            <Card>
                { exists(stream) && stream.map((post, index) => (
                    <Post key={index} post={post} />
                )) }
                { loading ? <LoadingSpinner /> : null }
            </Card>
        )
    }
}
```

The nion decorator supplies a `nion` prop to the child component, with a `stream` subprop. This stream subprop consists of an object combining the result of `selectData('stream')` with `requests` and `actions` properties

The `requests` property contains the result of applying the selector `selectRequest('stream')`. It contains all information regarding the network status of the given request. The `actions` property contains methods that dispatch redux actions corresponding to a given resource's REST actions.

Notice the `exists` method we're using to check existence of the stream data. The reason for this is that the nion decorator actually passes in an empty object to represent nonexistent data, since it makes the most sense syntacticallt to attach corresponding requests and actions properties to the top-level dataKey prop (`stream.actions`, for instance). Therefore, when the stream has yet to load, the `stream` property will simply be an empty object and will evaluate truthy using simple boolean existence checks. Therefore, nion exports the `exists` helper method to handle checking existence.

#### Post.jsx
```javascript
import React, { Component } from 'react'

class Post extends Component {
    render() {
        const { post } = this.props

        return (
            <Card>
                <strong>Post id: {post.id}</strong><br/>
            </Card>
        )
    }
}
```

#### note
For brevity's sake, we'll omit importing a few files that are used throughout the examples. These are

```javascript
import Card from 'components/Card'
import Button from 'components/Button'
import LoadingSpinner from 'components/LoadingSpinner'
```


<hr>


## 2. loading data on mount

It's a very common pattern to load data for a component when that component mounts. The nion decorator exposes a shorthand `fetchOnInit` property for handling this automatically. Note that this functionality is hard-wired to dispatch a `get` action. For more complex, non-standard behavior it's best to directly use the component lifecycle methods.

#### Stream.jsx
```javascript
import React, { Component } from 'react'
import nion, { exists } from 'libs/nion'

import Post from './Post'

@nion({
    stream: {
        endpoint: '/stream',
        fetchOnInit: true
    }
})
class Stream extends Component {
    render() {
        const { stream } = this.props.nion
        const { isLoading } = stream.request

        return (
            <Card>
                { exists(stream) && stream.map((post, index) => (
                    <Post key={index} post={post} />
                )) }
                { loading ? <LoadingSpinner /> : null }
            </Card>
        )
    }
}
```


<hr>


## 3. include and fields

JSON API allows us to specify which fields and related entities are fetched in a request. We can specify these JSON API parameters by passing a fully formed JSON API url to the `endpoint` parameter of the declarative. nion exports a buildUrl helper function for constructing fully formed JSON API urls, and we use that here to construct an endpoint specifying exactly what fields and included relationships we want to fetch.

#### Stream.jsx
```javascript
import React, { Component } from 'react'
import nion, { exists } from 'libs/nion'

import { streamInclude, streamFields } from './data-requirements'
import Post from './Post'

@nion({
    stream: {
        endpoint: buildUrl(`/stream`, {
            include: streamInclude,
            fields: streamFields
        }),
    }
})
class Stream extends Component {
    render() {
        const { stream } = this.props.nion
        const { isLoading } = stream.request

        return (
            <Card>
                { exists(stream) && stream.map((post, index) => (
                    <Post key={index} post={post} />
                )) }
                { loading ? <LoadingSpinner /> : null }
            </Card>
        )
    }
}
```

Notice that we're importing the `include` and `fields` parameters from an external file. This is a handy pattern for making the decorator more readable, and allows us to share commonly required fields across decorated components.

#### dataRequirements.js
```javascript
export const streamInclude = [
    'recent_comments.commenter',
    'recent_comments.parent',
    'recent_comments.post',
    'recent_comments.first_reply.commenter',
    'recent_comments.first_reply.parent',
    'recent_comments.first_reply.post'
]

export const streamFields = {
    'comment': [
        'body',
        'created',
        'deleted_at',
        'is_by_patron',
        'is_by_creator',
        'vote_sum',
        'current_user_vote',
        'reply_count'
    ],
    'post': [
        'comment_count'
    ],
    'user': [
        'image_url',
        'full_name',
        'url'
    ]
}

export const commentIncludes = [
    'commenter',
    'parent',
    'post',
    'first_reply.commenter',
    'first_reply.parent',
    'first_reply.post'
]
```


<hr>


## 4. pagination

Since our JSON-API interface uses a simple, cursor-based pagination system across API resources, the nion decorator can handle pagination in a consistent and elegant way.

Paginated resources are managed by simply setting the `paginated` parameter of the declarative, which tells the nion decorator to expose a few pagination-related properties to the child component. The main focus is the `next` action method, which is simply a `get` action method curried with the next page cursor returned from the initial request to the paginated resource's endpoint. In addition to dispatching this curried `get` request, the `next` method also dispatches the underlying `NION_API_SUCCESS` redux action with a special `isNextPage` meta property, which tells the internal reducers to append the result of the `next` request to the existing reference rather than overwriting it.

In addition to the next action method, the nion decorator also exposes a `canLoadMore` property to the `request` property - This is a convenience property indicating whether or not a next cursor link exists for a given paginated ref.

#### Stream.jsx
```javascript
import React, { Component } from 'react'
import nion, { exists, buildUrl } from 'libs/nion'

import { streamInclude, streamFields } from './data-requirements'
import Post from './Post'

@nion({
    stream: {
        endpoint: buildUrl(`/stream`, {
            include: streamInclude,
            fields: streamFields
        }),
        fetchOnInit: true,
        paginated: true
    }
})
class Stream extends Component {
    render() {
        const { stream } = this.props.nion
        const { canLoadMore, isLoading } = stream.request

        const fetchNext = () => stream.actions.next()

        return (
            <div>
                { exists(stream( && stream.map((post, index) => (
                    <Post key={index} post={post} />
                )) }
                { loading ? <LoadingSpinner /> : null }
                { canLoadMore ? <Button onClick={fetchNext}>Load More</Button> : null }
            </div>
        )
    }
}
```


<hr>


## 5. render post details

Let's go ahead and create the **Comments**, **Comment**, and **Like** components we'll need to render out all of the information we've fetched from the stream.

#### Post.jsx
```javascript
import React, { Component } from 'react'

import Comments from './Comments'

class Post extends Component {
    render() {
        const { post } = this.props

        const { commentCount, recentComments, currentUserHasLiked } = post

        return (
            <div>
                <strong>Post id: {post.id}</strong><br/>
                { commentCount } total { commentCount === 1 ? 'comment' : 'comments' }
                { commentCount ?
                    <Comments comments={recentComments} /> :
                    <span />
                }
                <Like liked={currentUserHasLiked} />
        </div>
        )
    }
}
```

#### Comments.jsx
```javascript
import React, { Component } from 'react'

import Comment from './Comment'

class Comments extends Component {
    render() {
        const { comments } = this.props

        return (
            <div>
            { comments.map(comment, index) => (
                <Comment comment={comment} />
            )) }
            </div>
        )
    }
}
```

#### Comment.jsx
```javascript
import React, { Component } from 'react'

class Comment extends Component {
    render() {
        const { comment } = this.props

        const body = comment.body.substring(0, 100) + '...'
        const name = comment.commenter.fullName

        return (
            <div>
                <strong>{ name }: </strong>{ body }
            </div>
        )
    }
}
```

#### Like.jsx
```javascript
import React from 'react'

return ({ liked, onClick }) => (
    <div onClick={onClick}>
        { liked ? '❤️' : 'like' }
    </div>
}
```


<hr>


## 6. like a post

In order to like a post, we need to create a new `like` resource on the server corresponding to the given post. In order to manage a potential `like` for each post, we need to set up an individual **dataKey** for each like that may be created. This will allow nion to manage the request lifecycle for each like that we may be creating for different posts.

The nion decorator can accept a function that creates a `declaration` from props, and we use this syntax to create a **dataKey** corresponding to each like. Notice that our decorator is now passed a function that accepts the incoming post prop, using its id to create a new `like:<post.id>` **dataKey** for each component. This means that when we call `like.actions.post()` to create a new like resource for a specific post, it's request lifecycle and data is managed on the redux state tree under it's own specific **dataKey**.

#### Post.jsx
```javascript
import React, { Component } from 'react'

import Comments from './Comments'

@nion(({ post }) => ({
    like: {
        dataKey: `like:${post.id}`,
        endpoint: buildUrl(`posts/${post.id}/likes`)
    }
}))
class Post extends Component {
    handleLikeClick = () => {
        const { like } = this.props.nion
        const { currentUserHasLiked } = this.props.post

        if (!currentUserHasLiked) {
            like.actions.post()
        }
    }

    render() {
        const { post } = this.props
        const { like } = this.props.nion

        const { commentCount, recentComments, currentUserHasLiked } = post

        return (
            <div>
                <strong>Post id: {post.id}</strong><br/>
                { commentCount } total { commentCount === 1 ? 'comment' : 'comments' }
                { commentCount ?
                    <Comments comments={recentComments} /> :
                    <span />
                }
                <LikeHeart liked={currentUserHasLiked} onClick={this.handleLikeClick} />
            </div>
        )
    }
}
```

One interesting detail in this component is that the `liked` property passed to the child **Like** component is determined by the existence of the server-computed `currentUserHasLikedproperty` of the post itself. In this case, displaying the correct like status won't work until we refresh the page or reload the stream, since we haven't changed the underlying post data when we create the new like. We'll see how to do this in the next section.


<hr>


## 7. mutating data

In Patreon's real-life code, the display logic for rendering post likes is actually a product of data stored on the post itself, not the presence or absence of a corresponding like. This information is represented by a prop on the post - `currentUserHasLiked`. In order to properly show when a user has liked a post, we need to update the underlying data for a specific entity - in this case, our post. We have two options here: First, we can either trigger an API request that returns the updated data, allowing it to propagate through the reducers and update all data accordingly. In this exmaple, however, we'll be manually updating the data rather than through an API request. We do this with the `updateEntity` nion method, which is passed in as a top-level method of the `nion` prop by the nion decorator. This method takes a **ref** (`{id, type}` tuple pointer) as the first argument, and a map of attributes to be updated on the corresponding entity.

The `updateEntity` nion action is extremely simple under the hood - it simply merges the passed in attributes object into the attributes of the relevant entity.

#### Post.jsx
```javascript
import React, { Component } from 'react'

import Comments from './Comments'

@nion(({ post }) => ({
    like: {
        dataKey: `like:${post.id}`,
        endpoint: buildUrl(`posts/${post.id}/likes`)
    }
}))
class Post extends Component {
    handleLikeClick = () => {
        const { like, updateEntity } = this.props.nion
        const { currentUserHasLiked, id: postId } = this.props.post

        if (!currentUserHasLiked) {
            like.actions.post().then(() => {
                updateEntity({ id: postId, type: 'post' }, { currentUserHasLiked: true })
            })
        }
    }

    render() {
        const { post } = this.props

        const { commentCount, recentComments, currentUserHasLiked } = post

        return (
            <div>
                <strong>Post id: {post.id}</strong><br/>
                { commentCount } total { commentCount === 1 ? 'comment' : 'comments' }
                { commentCount ?
                    <Comments comments={recentComments} /> :
                    <span />
                }
                <LikeHeart liked={currentUserHasLiked} onClick={this.handleLikeClick} />
            </div>
        )
    }
}
```

Notice also that all actions are functions that return a promise - this allows us to handle success and error of a given network request right next to the place where that action was called. In the example above, we're waiting until we successfully post a new like to the server before updating the underlying post data.


<hr>


## 8. unlike a post

In order to unlike a post, we're simply deleting the corresponding like resource from the server. This is functionally identical to the post action, and, just like any REST request action, it returns a promise that allows us to follow up on the result of the request.

#### Post.jsx
```javascript
import React, { Component } from 'react'

import Comments from './Comments'

@nion(({ post }) => ({
    like: {
        dataKey: `like:${post.id}`,
        endpoint: buildUrl(`posts/${post.id}/likes`)
    }
}))
class Post extends Component {
    handleLikeClick = () => {
        const { like, updateEntity } = this.props.nion
        const { currentUserHasLiked, id: postId } = this.props.post

        if (!currentUserHasLiked) {
            like.actions.post().then(() => {
                updateEntity({ id: postId, type: 'post' }, { currentUserHasLiked: true })
            })
        } else {
            like.actions.delete().then(() => {
                updateEntity({ id: postId, type: 'post' }, { currentUserHasLiked: false })
            })
        }
    }

    render() {
        const { post } = this.props

        const { commentCount, recentComments, currentUserHasLiked } = post

        return (
            <div>
                <strong>Post id: {post.id}</strong><br/>
                { commentCount } total { commentCount === 1 ? 'comment' : 'comments' }
                { commentCount ?
                    <Comments comments={recentComments} /> :
                    <span />
                }
                <LikeHeart liked={currentUserHasLiked} onClick={this.handleLikeClick} />
            </div>
        )
    }
}
```


<hr>


## 9. mutating data optimistically

In order to display the information indicating the intended action to the user as quickly as possible, we need to be able to optimistically update the data corresponding to the render logic - in this case, updating the post's `currentUserHasLiked` attribute. We simply use the updateEntity nion method to update the data we need to update before the corresponding request.

Since the `updateEntity` method returns a promise, we can chain it with nion REST actions to handle success / failure of network actions in a clear an concise manner. This allows us to undo our optimistic updates if the corresponding response fails.

#### Post.jsx
```javascript
import React, { Component } from 'react'

import Comments from './Comments'

@nion(({ post }) => ({
    like: {
        dataKey: `like:${post.id}`,
        endpoint: buildUrl(`posts/${post.id}/likes`)
    }
}))
class Post extends Component {
    setCurrentUserHasLiked = (currentUserHasLiked) => {
        return updateEntity({ id: this.props.post.id, type: 'post' }, { currentUserHasLiked })
    }

    handleLikeClick = () => {
        const { like, updateEntity } = this.props.nion
        const { currentUserHasLiked, id: postId } = this.props.post

        if (!currentUserHasLiked) {
            this.setCurrentUserHasLiked(true)
                .then(() => like.actions.post())
                .catch(() => setCurrentUserHasLiked(false))
            } else {
                this.setCurrentUserHasLiked(false)
                    .then(() => like.actions.delete())
                    .catch(() => setCurrentUserHasLiked(true))
            }
        }

    render() {
        const { post } = this.props

        const { commentCount, recentComments, currentUserHasLiked } = post

        return (
            <div>
                <strong>Post id: {post.id}</strong><br/>
                { commentCount } total { commentCount === 1 ? 'comment' : 'comments' }
                { commentCount ?
                    <Comments comments={recentComments} /> :
                    <span />
                }
                <LikeHeart liked={currentUserHasLiked} onClick={this.handleLikeClick} />
            </div>
        )
    }
}
```


<hr>


## 10. loading more comments

In our stream so far, we only load the 2 most recent comments for each post. However, we'd like to be able to load more comments, adding them to the list of comments already loaded. In order to achieve this advanced data management scenario, we need to create a new **dataKey** for the comments that is *pre-populated* with a reference to the already-loaded comments. We do this by using the `initialRef` property of the declarative to attach a reference to the already loaded comments to the nion state.

How does this work under the hood? It's actually quite simple. When we fetch a post, we're actually fetching `recentComments` as a relationship, which is just an array of `{type, id}` tuples pointing to the underlying comment entities. This is how the data is stored in the entities reducer, it's only through the `selectData` selector that the data becomes denormalized into a nested object. This underlying relationship pointer is a **ref**, and we can simply attach this to the references reducer by setting it as the `initialRef` property of the declarative.

Now, when we load the component, we do two things: First, we create a new **dataKey** for managing the post's comments (`postComments:<postId>`). Normally, the corresponding **ref** in the references reducer would be empty until we load it, but by providing an **initialRef** to the reducer, we construct a relationship between the already-existing data and the **dataKey**.

One final detail - notice the `makeRef` function used to supply the ref to the **initialRef** property. This function actually constructs a **ref** to the data from the underlying entity store's **refs**. This means that when we pass in `recentComments` to the makeRef function, it creates a ref with all of the corresponding pagination information brought along!

#### Comments.jsx
```javascript
import React, { Component } from 'react'
import map from 'lodash.map'
import nion, { buildUrl, makeRef } from 'libs/nion'

import { commentInclude, commentStreamFields } from './dataRequirements'
import Comment from './Comment'

@nion(({ postId, recentComments }) => ({
    comments: {
        dataKey: `postComments:${postId}`,
        endpoint: buildUrl(`/posts/${postId}/comments`, {
            include: commentInclude,
            fields: streamIncludes,
            page: {
                count: 10
            }
        }),
        paginated: true,
        initialRef: makeRef(recentComments)
    }
}))
class Comments extends Component {
    render() {
        const { comments } = this.props.nion
        const { canLoadMore, isLoading } = comments.request
        const fetchNext = comments.actions.next

        return (
            <div>
                { map(comments, (comment, index) => (
                    <Comment comment={comment} />
                )) }
                { isLoading ? <LoadingSpinner /> : null }
                { canLoadMore ? <Button onClick={fetchNext}>Load More</Button> : null }
            </div>
        )
    }
}
```

#### Post.jsx
```javascript
/* <Comments comments={recentComments} /> */
<Comments postId={post.id} recentComments={recentComments}
```


<hr>


## 11. loading replies

Now we'd like to load the replies to a given comment. Just like loading additional comments, we're starting with some initial data (the `firstReply`). And just like loading initial comments, we're going to have to pass off this first reply as an `initialRef` to the **Replies** component that will be handling loading the rest of the replies.

Notice that everything is almost exactly the same as above - we're passing in the `firstReply` as a prop to the **Replies** component, which then creates an **initialRef** using the `makeRef` function, thus "seeding" our references reducer with a pointer to the supplied first reply. The only wrinkle here is that we're manually setting the ref as a collection using the `isCollection` option. This ensures that we both pass in an array to the child component, and handle the result of fetching the next page properly.

#### Comment.jsx
```javascript
import React, { Component } from 'react'

import Replies from './Replies'

class Comment extends Component {
    render() {
        const { comment } = this.props

        const body = comment.body.substring(0, 100) + '...'
        const name = comment.commenter.fullName

        const { firstReply, replyCount } = comment

        return (
            <div>
                <strong>{ name }: </strong>{ body }
                { firstReply ?
                    <Replies
                        parentCommentId={comment.id}
                        count={replyCount}
                        firstReply={firstReply}
                    /> : null
                }
            </div>
        )
    }
}
```

#### Replies.jsx
```javascript
import React, { Component } from 'react'
import nion, { buildUrl, exists, makeRef } from 'libs/nion'

import { commentInclude, streamFields } from './dataRequirements'
import Comment from './Comment'

@nion(({ parentCommentId, firstReply }) => ({
    replies: {
        dataKey: `commentReplies:${parentCommentId}`,
        endpoint: buildUrl(`/comments/${parentCommentId}/replies`, {
            include: commentInclude,
            fields: streamFields
        }),
        initialRef: makeRef(firstReply, { isCollection: true })
    }
}))
class Replies extends Component {
    loadRemaining = () => {
        const { replies } = this.props.nion
        replies.actions.get()
    }

    render() {
        const { count } = this.props
        const { replies } = this.props.nion
        const { isLoading } = replies.request

        const remaining = count > 1 ? count - 1 : 0
        const canLoadMore = count > replies.length && remaining && !isLoading

        return (
            <Card>
                { exists(replies) && replies.map(reply => {
                    return <Comment comment={reply} />
                })}
                { canLoadMore ?
                    <Button onClick={this.loadRemaining}>Load {remaining} replies</Button> : null
                }
                { isLoading ? <LoadingSpinner /> : null }
            </Card>
        )
    }
}

```


<hr>


the end
