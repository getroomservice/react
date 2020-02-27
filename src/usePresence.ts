import { useEffect, useState, useContext } from "react";
import { RoomServiceContext } from "./context";

interface PresenceOptions {
  // "user" means the presence of a user, in any browser tab or device,
  // will be treated be updated simulataneously. If you have two tabs
  // open, but it's the same logged in user, you'll only show one mouse cursor.
  //
  // "connection" means every browser tab, device, or other "connection",
  // will have it's own presence. If you have two tabs open, but it's
  // the same logged in user, you'll show two mouse cursors.
  //
  // Default is by user.
  splitBy: "user" | "connection";
}

export function usePresence<T extends { [key: string]: any }, K extends string>(
  room: string,
  namespace: K
): [
  {
    [x: string]: {
      [key in K]: T;
    };
  },
  (val: T) => void
] {
  const [states, setStates] = useState({});
  const [_, setIsConnected] = useState(false);
  const client = useContext(RoomServiceContext);

  if (!client) {
    throw new Error(
      "usePresence was used outside the context of RoomServiceProvider. More details: https://err.sh/getroomservice/react/no-provider"
    );
  }

  const r = client.room(room);
  const splitBy = "user"; // TODO, allow "connection"

  useEffect(() => {
    async function setup() {
      if (!client) {
        throw new Error(
          "usePresence was used outside the context of RoomServiceProvider. More details: https://err.sh/getroomservice/react/no-provider"
        );
      }

      await r.init();

      r.onSetPresence((meta, value) => {
        if (meta.namespace !== namespace) {
          return;
        }

        const by =
          splitBy === "user" ? meta.guest!.reference : meta.connectionId!;

        const presence = {
          [namespace]: value
        };

        setStates(prevStates => {
          return { ...prevStates, [by]: presence };
        });
      });

      r.onConnect(() => {
        setIsConnected(true);
      });

      r.onDisconnect(() => {
        setIsConnected(false);
      });
    }
    setup().catch(err => console.error(err));

    return function cleanup() {
      if (room) {
        r.disconnect();
      }
    };
  }, [room, namespace]);

  function setPresence(value: T) {
    if (!client) {
      throw new Error(
        "usePresence was used outside the context of RoomServiceProvider. More details: https://err.sh/getroomservice/react/no-provider"
      );
    }

    r.setPresence(namespace, value);
  }

  // @ts-ignore
  return [states, setPresence];
}
