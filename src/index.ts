import RoomServiceClient from "@roomservice/browser";
import { useEffect, useState } from "react";
import { KeyValueObject } from "./types";

export function useRoomService<T extends KeyValueObject>(
  client: RoomServiceClient,
  roomReference: string
): [T, (cb: (state: T) => void) => void, boolean] {
  const room = client.room<T>(roomReference);
  const [state, setState] = useState<T>({} as T);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  async function load() {
    room.onConnect(() => {
      setIsConnected(true);
    });

    room.onDisconnect(() => {
      setIsConnected(false);
    });

    room.onUpdate(newState => {
      setState(newState);
    });

    await room.connect();
  }

  function publishState(callback: (state: T) => void) {
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
