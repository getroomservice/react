# No provider setup

Example text of the error:

```
useSharedState was used outside the context of RoomServiceProvider.
```

Or

```
usePresence was used outside the context of RoomServiceProvider.
```

## Why this error occurred

You used a hook like `useSharedState` or `usePresence` without a correctly setup provider. Or, you've used a hook in a component that's not within the provider component.

## How to fix this

First, make sure you've setup your `RoomServiceProvider` as early as possible within your app like so:

```tsx
import { RoomServiceProvider, useSharedState } from "@roomservice/react";

function CollaborativeComponent() {
  const [sharedState, setSharedState] = useSharedState("my-room");
  return <div>{/* ... */}</div>;
}

function App() {
  return (
    <RoomServiceProvider authUrl="/api/roomservice">
      <CollaborativeComponent />
    </RoomServiceProvider>
  );
}
```

If that does not fix your error, make sure the component that uses the hook is used within the `RoomServiceProvider`.

For example, this will break:

```tsx
/**
 * This is an incorrect setup.
 */
import { RoomServiceProvider, useSharedState } from "@roomservice/react";

function CollaborativeComponent() {
  const [sharedState, setSharedState] = useSharedState("my-room");
  return <div>{/* ... */}</div>;
}

function PoorlySetupApp() {
  return (
    <div>
      <RoomServiceProvider authUrl="/api/roomservice">
        <div>Hello there!</div>
      </RoomServiceProvider>

      {/* Notice that the component is not a child, or child's child, or even
      a child's child of the RoomServiceProvider! */}
      <CollaborativeComponent />
    </div>
  );
}
```
