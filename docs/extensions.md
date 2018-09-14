# Extensions

nion provides extensions as a way of automatically composing useful functions and meta values out of a resource's data and its basic actions. 

The JSON API pagination extension is a great example; it relies on JSON API responses having a particular format for pagination links and composes useful `next()`, `prev()`, `first()`, and `last()` functions that use the nion-provided `GET` action to fetch data with those links.

Extensions are dead simple to write; a valid extension is an object with two required functions:

function | description
-------- | -----------
`composeActions` | returns an **object** of functions that are composed of options and a resource's actions and/or data
`composeMeta` | returns an **object** of meta values composed of a resource's data

## Configuration

Extensions have to be imported and registered with nion's configuration when the store is configured. `configureNion` takes an `extensions` option that consists of a map of extensions keyed by the name by which you'll refer to them throughout your application. For instance:

```javascript
import exampleExtension from './example-extension'
import { configureNion } from 'nion'

const { reducer: nionReducer } = configureNion({
	extensions: {
		myExtension: exampleExtension
	}
})
```

[Read more about configuration here.](configuration.md)

## Declaration

In a declaration, you can add extensions to a resource by passing a map of extension names and options to the `extensions` option. Not all extensions require options, so you can pass an empty object as well:

```javascript
@nion({
    dataKey: {
        someEndpoint,
        extensions: { myExtension: {} },
    },
})
```

[Read more about declaration options here.](declarations.md)

## In Practice

The resource the nion decorator provides in props looks like this when extended:

```javascript
// props.nion.dataKey
{
    data,
    actions,
    request,
    extra,
    extensions: {
        myExtension: {
            aFunction: fn(),
            anotherFunction: fn(),
            meta: {
                someValue: true,
            },
        },
    },
}
```
