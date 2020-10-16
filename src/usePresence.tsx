import { useState, useEffect, useRef } from 'react';
import { PresenceClient } from '@roomservice/browser';
import { useRoom } from './useRoom';

export function usePresence<T extends any>(
  roomName: string,
  key: string
): [{ [key: string]: T }, (value: T) => any] {
  const presence = useRef<PresenceClient>();
  const [val, setVal] = useState<{ [key: string]: T }>({});
  const room = useRoom(roomName);

  useEffect(() => {
    if (!room) return;

    const p = room!.presence();
    presence.current = p;

    room!.subscribe<T>(p, key, val => {
      setVal(val);
    });
  }, [room, key]);

  //TODO: batch calls to this function before presence is ready
  function set(value: T) {
    if (!presence.current) return;
    presence.current?.set(key, value);
  }

  return [val, set];
}
