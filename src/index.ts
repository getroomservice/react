import { useEffect, useState } from "react";
import RoomServiceClient, { RoomClient } from "./client";

export function useRoomService<T extends object>(
  client: RoomServiceClient,
  roomReference: string
) {
  const [state, setState] = useState<T>();
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
    // TODO, write to offline here
    if (!room) {
      return;
    }

    room.publish(state || ({} as T), callback);
  }

  useEffect(() => {
    load();
  }, [roomReference]);

  return [state, publish, isConnected];
}
