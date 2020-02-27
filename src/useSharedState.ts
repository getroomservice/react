import { useEffect, useState, useContext } from "react";
import { RoomServiceContext } from "./context";

export function useSharedState<T>(
  roomReference: string,
  defaultState?: T
): [T, (cb: (state: T) => void) => void, boolean] {
  const client = useContext(RoomServiceContext);
  const [state, setState] = useState<T>((defaultState || {}) as T);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  if (!client) {
    throw new Error(
      "useSharedState was used outside the context of RoomServiceProvider. More details: https://err.sh/getroomservice/react/no-provider"
    );
  }

  const room = client.room<T>(roomReference, defaultState);

  async function load() {
    if (!client) {
      throw new Error(
        "useSharedState was used outside the context of RoomServiceProvider. More details: https://err.sh/getroomservice/react/no-provider"
      );
    }

    room.onConnect(() => {
      setIsConnected(true);
    });

    room.onDisconnect(() => {
      setIsConnected(false);
    });

    room.onSetDoc((newState: T) => {
      setState(newState);
    });

    // restore from offline cache
    // (this has an await but it's real quick)
    const offlineState = await room.restore();
    setState(offlineState);

    // attempt to connect online
    const { doc } = await room.init();
    setState(doc as Readonly<T>);
  }

  function publishState(callback: (state: T) => void) {
    room.setDoc(callback).then(s => {
      setState(s);
    });
  }

  useEffect(() => {
    load().catch(err => console.error(err));

    return function cleanup() {
      if (room) {
        room.disconnect();
      }
    };
  }, [roomReference]);

  return [state, publishState, isConnected];
}
