import { useContext, useEffect, useState } from 'react';
import { RoomClient } from '@roomservice/browser';
import { clientContext } from './contextForClient';
import { errOutsideOfProvider } from './errors';

export function useRoom(roomName: string): RoomClient | undefined {
  const ctx = useContext(clientContext);
  if (!ctx.addRoom) {
    throw errOutsideOfProvider();
  }
  const [room, setRoom] = useState<RoomClient>();

  useEffect(() => {
    async function load() {
      setRoom(await ctx!.addRoom!(roomName));
    }

    load().catch(console.error);
  }, [roomName]);

  return room;
}
