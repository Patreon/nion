# api modules
nion uses api modules internally to set up and handle requests to the API, and parse the corresponding responses. An API module is defined as an object that has an interface defined below:

property | description | required
-------- | ----------- | --------
`parser` | A method responsible for parsing a JSON response from a server and converting it into data that nion's reducers will use internally | required
`request` | A set of methods that handle request parameters and before / after request hooks | optional
`pagination` | A set of methods that handle pagination-related logic for paginated resources | optional
`ErrorClass` | A class / constructor to handle API Errors in an application-specific way | optional

## `parser`
```javascript
interface Ref {
    type: string
    id: string
}

interface StoreFragment {
    [type: string]: {
        [id: string]: {
            attributes: {
                [attribute: string]: any
            }
            relationships?: {
                [name: string]: Ref | Array<Ref>
            }
        }
    }
}

interface EntryRef {
    entities: Array<Ref>
    isCollection: boolean
    [extras: string]: any
}

interface ParsedResponse {
    storeFragment: StoreFragment
    entryRef: EntryRef
}

function parser(data: JSON): ParsedResponse {}
```
The `parser` attribute is a single method that ingests JSON from the request response and formats it into data compatible with nion's reducer internals. The expected output of the function is an object with two keys: `storeFragment` (a "fragment" of the normalized entities that will be merged into the `entities` store), and `entryRef` (which contains the ref to be loaded onto the `references` store).  

## `request`

```javascript
interface Parameters {
    headers: {
        [key: string]: string
    }
}

function getRequestParameters(method: string, options: any): Parameters {}
```
The `request` attribute exposes a single method `getRequestParameters` which returns the request parameters that will be provided to the `fetch` method used inside of the nion api action.

## `pagination`
```javascript
function canLoadMore(data: SelectedData): boolean {}

function getNextUrl(declaration: Declaration, data: SelectedData): string {}
```
The `pagination` attribute exposes two methods, `canLoadMore` and `getNextUrl` that are used for implementing pagination schemes within nion. nion uses these two methods to implement pagination for declarations where the `paginated` attribute is set to `true`.

## `ErrorClass`
```javascript
interface ErrorClass extends Error {
    name: string,
    status: number,
    statusText: string,
    response: any
    message: string
    errors: any[]
}
```
The `ErrorClass` attribute exposes a class that extends the generic JavaScript `Error` class with useful properties for handling API errors inside nion in an application-specific way.
