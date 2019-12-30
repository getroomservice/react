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

    r.onUpdate(newState => {
      setState(newState);
    });

    const { state } = await r.connect();
    setState(state);
  }

  function publishState(callback: (state: T) => void) {
    // It's technically possible to call this before it gets set,
    // but we'll just ignore that quirk for now.
    if (!room) {
      return;
    }

    const newDoc = room.publishState(callback);
    setState(newDoc);
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
