# `@roomservice/react`

The `@roomservice/react` library is the main JS library for RoomService. You should use it _with_ the `@roomservice/browser` library.

## Installing

```
npm install --save @roomservice/react@next
```

or, with [yarn](https://yarnpkg.com/):

```
yarn add @roomservice/react@next
```

## Usage

### Setup a `<RoomServiceProvider />`

At the top of your app, add a `RoomServiceProvider` with your [auth endpoint](https://www.roomservice.dev/docs/auth).

```js
import { RoomServiceProvider } from "@roomservice/react";

function App() {
  return (
    <RoomServiceProvider authUrl="https://yoursite.com/api/roomservice">
      <CollaborativeComponent />
    </RoomServiceProvider>
  );
}

export default App;
```

### `useSharedState`

Shared state lets you and other folks in the room collaborate on the same JSON state. Shared state has a built-in CRDT and offline support, so you can assume that merges will happen automatically, deterministically, and without the need for constant internet connection.

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

#### Rules of sharedState

**Rule 1: only use a function parameter.** Unlike the regular `setState`, `setSharedState` _only_ supports a function as an argument, not an object.

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

**Rule 2: don't return anything.** As you may have noticed, the function you pass into `setSharedState` does not _return_ anything from the document like `setState` does. Instead, it works like [Immer](https://immerjs.github.io/immer/docs/introduction) does; you mutate the object itself.

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

**Rule 3: only JSON primitives.** Don't pass classes, functions, or React components into your shared state. Only JSON primitives, like lists, numbers, strings, and maps work. As a rule of thumb, if it wouldn't be valid in `someFile.json`, it won't be valid in Room Service.

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

### `usePresence`

Presence is temporary state for each individual user in a room that, like shared-state, updates automatically. Presence is not stored in a CRDT and does not do automatic merging.

Unlike shared state, presence has extremely low latency, which makes it perfect for:

- Mouse cursors
- GPS locations
- the cell position in a table
- device info
- the tab someone's on
- ???

```js
import { usePresence } from "@roomservice/react";

const [positions, setMyPosition] = usePresence("my-room", "cell-positions");

// Set your presence.
setMyPosition({
  x: 0,
  y: 10
});

// Access other user's presence
const { x, y } = positions["my-user-reference"];
```

Note that presence returns an object, not an array. So if you want to iterate through multiple folks presences, you should use `Object.values`.

```js
function MapPins() {
  const [locations, setMyPresence] = usePresence("my-room", "locations");

  Object.values(locations).map(location => {
    return <Pin lat={location.lat} long={location.long} >
  })
}
```

Presence is meant to be a primitive to make other declarative real-time features. So get creative and make your own custom hooks!
