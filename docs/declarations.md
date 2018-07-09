# Declarations

The nion decorator takes in a **declaration** that points to a particular endpoint and optionally, some configuration that controls how nion will handle that data. The decorator then passes a representation of the resulting API resource to the decorated component as props. Here's a simple example of a declaration being passed to the decorator:

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