import RoomServiceClient from "@roomservice/browser";
import { useEffect, useState } from "react";
import { KeyValueObject } from "./types";

export function useRoomService<T extends KeyValueObject>(
  client: RoomServiceClient,
  roomReference: string
): [T, (cb: (state: T) => void) => void, boolean] {
  const [room, setRoom] = useState();
  const [state, setState] = useState<T>({} as T);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  async function load() {
    const r = client.room<T>(roomReference);
    setRoom(r);

    r.onConnect(() => {
      setIsConnected(true);
    });

    r.onDisconnect(() => {
      setIsConnected(false);
    });

    r.onUpdateDoc(newState => {
      setState(newState);
    });

    // restore from offline cache
    // (this has an await but it's real quick)
    const offlineState = await r.restore();
    setState(offlineState);

    // attempt to connect online
    const { doc } = await r.init();
    setState(doc);
  }

  function publishState(callback: (state: T) => void) {
    // It's technically possible to call this before it gets set,
    // but we'll just ignore that quirk for now.
    if (!room) {
      return;
    }

    const state = room.publishDoc(callback);
    setState(state);
  }

  useEffect(() => {
    load();

    return function cleanup() {
      if (room) {
        room.disconnect();
      }
    };
  }, [roomReference]);

  return [state, publishState, isConnected];
}
