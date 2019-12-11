import { useEffect, useState } from "react";
import RoomServiceClient, { RoomClient } from "./client";
import { KeyValueObject } from "./types";

export function useRoomService<T extends KeyValueObject>(
  client: RoomServiceClient,
  roomReference: string
): [T, (cb: (state: T) => void) => void, boolean] {
  const [state, setState] = useState<T>({} as T);
  const [room, setRoom] = useState<RoomClient<T>>();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  async function load() {
    const r = await client.room<T>(roomReference);
    setRoom(r);

    r.onConnect(() => {
      setIsConnected(true);
    });

    r.onDisconnect(() => {
      setIsConnected(false);
    });

    r.onUpdate(state => {
      setState(state);
    });
  }

  function publish(callback: (state: T) => void) {
    // optimisticly render this to make things snappy

    // TODO, write to offline here
    if (!room) {
      console.log("no room defined");
      return;
    }

    const newDoc = room.publish(state || ({} as T), callback);
    setState(newDoc);
  }

  useEffect(() => {
    load();
  }, [roomReference]);

  return [state, publish, isConnected];
}
