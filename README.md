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
import { useRoomService } from "@roomservice/react";

function MyComponent() {
  const [sharedState, setSharedState] = useRoomService(client, "my-room");

  function onChange() {
    setSharedState(prevState => () => {
      prevState.myOption = "hello!";
    });
  }

  // ...
}
```
