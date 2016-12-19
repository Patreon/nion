# nion api

## @nion decorator
```javascript
@nion(declarations || (props) => declarations)
class MyComponent extends Component
```

The nion decorator accepts either a map of declarations, or a function that accepts props and returns a map of declarations.

#### examples
```javascript
@nion({
    currentUser: {
        endpoint: '/current_user'
    }
})

class MyComponent extends Component
```
The above example is the simplest declaration possible - the **dataKey** is set automatically to the key of the declaration, in this case `currentUser`, and the **endpoint** is set to `/current_user` in the declaration.


```javascript
@nion(({ userId }) => ({
    user: {
        dataKey: `user:${userId}`,
        endpoint: `/users/${userId}`
    }
}))
class MyComponent extends Component
```
The above example shows how to build a declaration using function syntax, where the function passed to the decorator transforms the component's props into a declaration - In this case, the **dataKey** is set manually to correspond to the passed in `userId` prop, and the **endpoint** is set to according to the input prop as well. Note that the **dataProp** passed into the child component corresponds to the key of the declaration (`currentUser`) in both cases.

## declaration
A declaration is what tells nion **what** data to manage, **where** to fetch it from, and **how** to manage it. A declaration is an object of options with a `key` that is automatically mapped to the corresponding `dataKey`. This key also determines the prop name passed to the underlying component.

A declaration has a number of potential properties

property | type | description | required
-------- | ---- | ----------- | --------
**endpoint** | `string` | The pathname or json-api url from which to fetch / manage the dataKeys. This can be either a shorthand pathname (ie `/currentUser`) or a fully-built json-api url (built using `buildUrl`) | **true**
**dataKey** | `string` | A manual override of the `dataKey` to use to manage data. Defaults to the key of the declaration |
**onMount** | `boolean` | Whether or not to automatically invoke a `get` action when the component mounts. Defaults to `false` |
**once** | `boolean` | If `onMount` is `true`, whether or not to fetch the data *every* time the component mounts or just *once*. Defaults to `true`. |
**paginated** | `boolean` | Whether or not the managed resource is paginated. Exposes a number of pagination-specific `request` status parameters and the `next` action.
**initialRef** | `ref` | The initial ref used to initialize the reference corresponding to the `dataKey`, usually built with the `makeRef` function. This is used to pass ownership of data from a parent component to a child. See the parent/child or stream examples for more documentation about this more advanced use case. |
