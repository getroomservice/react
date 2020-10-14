# No Provider

A hook is being used outside the RoomServiceProvider.

## Why you're getting this error

You're using a Room Service hook such as `useMap`, `useList`, `usePresence` or `useRoom`, without
a `RoomServiceProvider` setup higher up in your project.

### You may not have setup a `<RoomServiceProvider />`

Typically at the beginning of your project, in an `App.js` file, or `/pages/xyz.js` file, you'll
need to setup the provider:

```tsx
import { RoomServiceProvider } from '@roosmervice/react';

function App() {
  return (
    <RoomServiceProvider clientParameters={{ auth: '/roomservice' }}>
      {/* ... */}
    </RoomServiceProvider>
  );
}
```

### You may be using a hook inside the same component as `<RoomSerivceProvider />`

Like other React libraries that use [context](https://reactjs.org/docs/context.html) providers, Room Service's hooks
will only work in the _children_ of your provider.

This does **NOT** work:

```tsx
import { RoomServiceProvider, useMap } from '@roosmervice/react';

function App() {
  // BAD
  const [map, setMap] = useMap('myroom', 'mymap');

  return (
    <RoomServiceProvider clientParameters={{ auth: '/roomservice' }}>
      {/* ... */}
    </RoomServiceProvider>
  );
}
```

This **DOES** work:

```tsx
function TheRestOfYourProject() {
  // The hook works here, because it's referring to a component
  // within the provider's tree.
  const [map, setMap] = useMap('myroom', 'mymap');
  if (!map) return null;

  return <div>{map.get('some-key')}</div>;
}

function App() {
  return (
    <RoomServiceProvider clientParameters={{ auth: '/roomservice' }}>
      <TheRestOfYourProject />
    </RoomServiceProvider>
  );
}
```

### You may be using a hook outside of the provider's tree

You may have your provider setup not on the top level of your project, but farther
down within the project. If you are, be sure that your hooks are used within the tree
of the provider, and not adjacent to it.

For example, this won't work:

```tsx
import { RoomServiceProvider } from '@roosmervice/react';

function Adjacent() {
    // BAD: This won't work!
    const [map, setMap] = useMap("myroom", "mymap")

    if (!map) return null;
    return <div>{map.get('some-key')}</div>;
}

function App() {
  return (
    <div>
      <div>
        <Adjacent />
      </div>
      <RoomServiceProvider clientParameters={{ auth: '/roomservice' }}>
        {/* ... */}
      </RoomServiceProvider>
    <div>
  );
}
```
