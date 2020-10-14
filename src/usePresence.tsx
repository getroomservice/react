import { useState, useEffect } from 'react';
import { PresenceClient } from '@roomservice/browser';
import { useRoom } from './useRoom';

export function usePresence<T extends any>(
  roomName: string,
  key: string
): [{ [key: string]: T }, (value: T) => any] {
  const [presence, setPresence] = useState<PresenceClient>();
  const [val, setVal] = useState<{ [key: string]: T }>({});
  const room = useRoom(roomName);

  useEffect(() => {
    if (!room) return;

    const p = room.presence();
    setPresence(p);

    room.subscribe<T>(p, key, val => {
      setVal(val);
    });
  }, [room, key]);

  function set(value: T) {
    if (!presence) return;
    presence?.set(key, value);
  }

  return [val, set];
}
