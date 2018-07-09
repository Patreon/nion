# Declarations

The nion decorator takes in a map of **declarations** that point a `dataKey` to a given API resource. The decorator then passes a representation of the resulting API resource(s) to the decorated component as props. Here's a simple example of a declaration being passed to the decorator:

```javascript
@nion({
    currentUser: {
        endpoint: 'https://patreon.com/api/current_user',
    }
})
```

## Dynamic Declarations
Simple declarations take the form of plain old javascript objects, but the nion decorator will also accept functions that take in the wrapped component's props and _return_ an object. Here's a simple example:

```javascript
@nion(({ dynamicDataKey }) => {
	resource: {
		dataKey: dynamicDataKey,
		endpoint: 'https://patreon.com/api/puppies',
	}
})
class PuppyContainer extends Component {
   static propTypes = {
       dynamicDataKey: PropTypes.string.isRequired,
   }
}
```

## Declaration Options

property | type | description | required
--------- | ---- | ----------- | --------
**endpoint** | `string` | The fully-formed url from which to fetch / manage the dataKeys. | **true**<sup>*</sup>
**dataKey** | `string` | A manual override of the `dataKey` to use to manage data. Defaults to the key of the declaration. | false
**fetchOnInit** | `boolean` | Whether or not to automatically invoke a `get` action when the component mounts. Defaults to `false`. | false
**fetchOnce** | `boolean` | If `fetchOnInit` is `true`, whether or not to fetch the data *every* time the component mounts or just *once*. Defaults to `true`. | false
**initialRef** | `ref` | The initial ref used to initialize the reference corresponding to the `dataKey`, usually built with the `makeRef` function. This is used to pass ownership of data from a parent component to a child. See the parent/child or stream examples for more documentation about this more advanced use case. | false
**extensions** | `object` | A map of extensions to apply to the resource that gets passed to the wrapped component. | false