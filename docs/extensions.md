nion extensions
---

nion provides extensions as a way of automatically composing useful functions and meta values out of a resource's data and its basic actions. The JSON API pagination extension is a great example; it relies on JSON API responses having a particular format for pagination links and composes useful `next()`, `prev()`, `first()`, and `last()` functions that use the nion-provided `GET` action to fetch data with those links.

Extensions are dead simple to write; a valid extension is an object with two required functions:

function | description
-------- | -----------
`composeActions` | returns an **object** of functions that are composed of options and a resource's actions and/or data
`composeMeta` | returns an **object** of meta values composed of a resource's data

Extensions can be included in a nion declaration like this:

```javascript
@nion({
    dataKey: {
        someEndpoint,
        extensions: { myExtension: true },
    },
})
```

You can also pass options to an extension like this:

```javascript
@nion({
    dataKey: {
        someEndpoint,
        extensions: {
            myExtension: {
                someOption: true,
                someOtherOption: 3,
            },
        },
    },
})
```

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
