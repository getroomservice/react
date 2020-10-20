import { useContext, useEffect, useState } from 'react';
import { RoomClient } from '@roomservice/browser';
import { context } from './context';

export function useRoom(roomName: string): RoomClient | undefined {
  const ctx = useContext(context);
  if (!ctx.addRoom) {
    throw new Error(
      'A hook is being used outside the RoomServiceProvider. Learn more: https://err.sh/getroomservice/react/no-provider'
    );
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
