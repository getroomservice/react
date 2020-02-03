# `@roomservice/react`

The `@roomservice/react` library is the main JS library for RoomService. You should use it _with_ the `@roomservice/browser` library.

## Installing

```
npm install --save @roomservice/react @roomservice/browser
```

## Usage

### Create an instance of the RoomService client.

You should use the auth endpoint that you setup on your own backend.

```js
import RoomService from "@roomservice/browser";

const client = new RoomService({
  authorizationUrl: "https://your-backend/your/auth/endpoint"
});
```

### useRoomService

Regular usage:

```js
import { useSharedState } from "@roomservice/react";

function MyComponent() {
  const [sharedState, setSharedState] = useSharedState(client, "my-room");

  function onChange() {
    setSharedState(prevState => {
      prevState.myOption = "hello!";
    });
  }

  // ...
}
```

## Caveats

**Caveat 1: only use a function parameter.** Unlike the regular `setState`, `setSharedState` _only_ supports a function as an argument, not an object.

For example:

```js
// BAD - not allowed
setSharedState({
  title: "hello!"
});

// GOOD - this works
setSharedState(prevState => {
  prevState.title = "hello!";
});
```

**Caveat 2: don't return anything.** As you may have noticed, the function you pass into `setSharedState` does not _return_ anything from the document like `setState` does. Instead, it works like [Immer](https://immerjs.github.io/immer/docs/introduction) does; you mutate the object itself.

For example:

```js
// BAD - don't return
setSharedState(prevState => {
  return {
    ...prevState,
    title: "hello!"
  };
});

// GOOD - mutate the object instead
setSharedState(prevState => {
  prevState.title = "hello!";
});
```

**Caveat 3: only JSON primitives.** Don't pass classes, functions, or React components into your shared state. Only JSON primitives, like lists, numbers, strings, and maps work. As a rule of thumb, if it wouldn't be valid in `someFile.json`, it won't be valid in Room Service.

For example:

```js
class MyBike {
  zoom() {}
}

// BAD - this won't work like you expect
setSharedState(prevState => {
  prevState.bike = new MyBike();
});
```
