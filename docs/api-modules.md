# api modules
nion uses api modules internally to set up and handle requests to the API, and parse the corresponding responses. An API module is defined as an object that has an interface defined below:

### Usage
To use an API module other that your default add 
```
apiType: MY_API_MODULE_NAME
```

To your nion component declaration.

## Creating your own api-module

property | description | required
-------- | ----------- | --------
`parser` | A method responsible for parsing a JSON response from a server and converting it into data that nion's reducers will use internally | required
`request` | A set of methods that handle request parameters and before / after request hooks | optional
`ErrorClass` | A class / constructor to handle API Errors in an application-specific way | optional

### `parser`
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

### `request`

```javascript
interface Parameters {
    headers: {
        [key: string]: string
    }
}

function getRequestParameters(method: string, options: any): Parameters {}
```
The `request` attribute exposes a single method `getRequestParameters` which returns the request parameters that will be provided to the `fetch` method used inside of the nion api action.

### `ErrorClass`
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
