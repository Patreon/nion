# Usage

There are two main ways to use nion from React: as a _hook_, or as a _HOC_ (higher-order component). The HOC usage itself comes in two forms: modern HOC and legacy decorators.

## As a hook

When writing new code, the recommended way to use nion is the `useNion` [hook](https://reactjs.org/docs/hooks-intro.html). Note that the `dataKey` in the declaration is required.

```js
import { useNion } from '@nion/nion'

export const UserContainer = () => {
    const [currentUser, actions, request] = useNion({
        dataKey: 'currentUser',
        endpoint: 'https://patreon.com/api/current_user',
    })

    const loadButton = <Button onClick={() => actions.get()}>Load</Button>

    return (
        <Card>
            {request.isLoading ? <LoadingSpinner /> : loadButton}
            {currentUser && <UserCard user={currentUser} />}
        </Card>
    )
}
```

## As a modern HOC

Since a class component does not support hooks, when working with one, use the `nion` [higher-order component (HOC)](https://reactjs.org/docs/higher-order-components.html) instead. Note that the `dataKey` can be omitted from the declaration, since it is inferred from the property name that contains the declaration.

```js
import { nion } from '@nion/nion'

class UserContainer extends Component {
    render() {
        const { currentUser } = this.props.nion
        const { request, actions, data } = currentUser

        const loadButton = <Button onClick={() => actions.get()}>Load</Button>

        return (
            <Card>
                {request.isLoading ? <LoadingSpinner /> : loadButton}
                {data && <UserCard user={data} />}
            </Card>
        )
    }
}

export default nion({
    currentUser: {
        endpoint: 'https://patreon.com/api/current_user',
    },
})(UserContainer)
```

## As a legacy decorator

Decorators are a proposed JavaScript language feature that, at the time of writing, have not been completely formalized into the ECMAScript specification. As an additional complication, there are two versions of the decorator proposal: the [legacy decorator](https://github.com/wycats/javascript-decorators), which is in wide-spread use, and the [TC39 decorator](https://github.com/tc39/proposal-decorators), which will almost certainly become the final form of how decorators will work in JavaScript. This means that existing code that uses legacy decorators will become non-standard when the TC39 decorator is standardized into the spec.

For the purposes of using nion, however, a decorator is simply an outdated syntax for using the HOC version of nion. The following illustrates what this outdated syntax looks like:

```js
import { nion } from '@nion/nion'

@nion({
    currentUser: {
        endpoint: 'https://patreon.com/api/current_user',
    },
})
export class UserContainer extends Component {
    render() {
        const { currentUser } = this.props.nion
        const { request, actions, data } = currentUser

        const loadButton = <Button onClick={() => actions.get()}>Load</Button>

        return (
            <Card>
                {request.isLoading ? <LoadingSpinner /> : loadButton}
                {data && <UserCard user={data} />}
            </Card>
        )
    }
}
```

Fortunately, it is easy to update this outdated syntax into standardized syntax: switch to the modern HOC form in the previous section. To re-iterate, the following:

```js
@nion(x)
export default class A extends Component {
    render() {}
}
```

Can be mechanically rewritten to this:

```js
class A extends Component {
    render() {}
}

export default nion(x)(A)
```
