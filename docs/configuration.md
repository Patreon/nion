# Configuration

The `configureNion` function takes a single `options` argument consisting of the following keys:

key | type | description
--- | ---- | -----------
`apiModules` | `{ [name]: ApiModule }` | a map of api-modules with keys corresponding to their names (used by the decorator to look up which module to use)
`extensions` | `{ [name]: Extension }` | a map of extensions corresponding to their names
`lifecycle` | `{ [lifecycle hook]: Function }` | a map of methods to call for particular lifecycle hooks
`defaultApi` | `string` | a string pointing a particular `ApiModule` registered in the `apiModules` option
