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
      let room = ctx.rooms[roomName];
      if (!room) {
        room = await ctx!.addRoom!(roomName);
      }
      setRoom(room);
    }

    load().catch(console.error);
  }, [roomName, ctx.addRoom]);

  return room;
}
