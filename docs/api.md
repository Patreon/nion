# nion api

<hr />
## @nion decorator
```javascript
@nion(declaratives || (props) => declaratives)
class MyComponent extends Component
```

The nion decorator accepts either a map of declaratives, or a function that accepts props and returns a map of declaratives.

#### examples
```javascript
@nion({
    currentUser: {
        endpoint: '/current_user'
    }
})
class MyComponent extends Component
```
```javascript
@nion(({ userId }) => ({
    user: {
        endpoint: `/users/${userId}`
    }
}))
class MyComponent extends Component
```


<hr />
## declarative
A declarative is what tells nion **what** data to manage, **where** to fetch it from, and **how** to manage it. A declarative is an object of options with a `key` that is automatically mapped to the corresponding `dataKey`. This key also determines the prop name passed to the underlying component.

A declarative has a number of potential properties

property | type | description
-------- | ---- | -----------
endpoint | `string` | the pathname or json-api url from which to fetch / manage the dataKeys
dataKey | `string` | a manual override of the `dataKey` to use to manage data. Defaults to the key of the declarative
onMount | `boolean` | whether or not to automatically invoke a `get` action when the component mounts. default `false`
once | `boolean` | if set to `onMount`, whether or not to do i
