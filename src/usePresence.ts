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

export function usePresence<T>(
  room: string,
  key: string,
  options?: PresenceOptions
): [{ [key: string]: T }, (v: T) => void] {
  const [states, setStates] = useState({});
  const client = useContext(RoomServiceContext);
  if (!client) {
    throw new Error(
      "usePresence was used outside the context of RoomServiceProvider. More details: https://err.sh/getroomservice/react/no-provider"
    );
  }

  const r = client.room(room);

  const splitBy = options?.splitBy || "user";

  useEffect(() => {
    async function setup() {
      await r.init();

      r.onSetPresence((meta, value) => {
        const key =
          splitBy === "user" ? meta.guest!.reference : meta.connectionId!;

        setStates(prevStates => {
          return { ...prevStates, [key]: value };
        });
      });
    }
    setup();
  }, [room, key]);

  function setPresence(value: any) {
    r.setPresence(key, value);
  }

  return [states, setPresence];
}
