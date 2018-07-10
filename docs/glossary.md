# Glossary

## Common types and what they're for

### `ref`

A tuple used to **ref**er to a specific entity in the redux store.
  
```
{
  	type: string
  	id: string
}
```
  
### `dataKey`

A `string` that corresponds to a particular nion-managed address within the redux store:

```
store.getState().nion.references[dataKey]
```
 
### `resource`

A representation of an API endpoint that is injected into a nion-decorated component. If you've got a `dataKey` called `currentUser` and you've already fetched some data, you can expect the decorated component to have a resource under `this.props.nion.currentUser` that looks like this:

```
{
	actions: {
		(HTTP methods to operate on the endpoint)
	},
	data: {
		(denormalized api data)
	},
	extensions: {
		(extra functions and meta values provided by extensions)
	},
	extra: {
		(meta values returned along with api data)
	},
	request: {
		(meta values concerning the state of the resource's last request)
	}
}
```

## Frequently-used terms