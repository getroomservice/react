import { useState, useEffect, useRef } from 'react';
import { PresenceClient } from '@roomservice/browser';
import { useRoom } from './useRoom';

type UpdateFn<T extends any> = (current?: T) => T;

export interface PresenceUpdater<T extends any> {
  set(valueOrUpdateFn: T | UpdateFn<T>): any;
}

export function usePresence<T extends any>(
  roomName: string,
  key: string
): [{ [key: string]: T }, PresenceClient<T>?] {
  const presence = useRef<PresenceClient<T>>();
  const [val, setVal] = useState<{ [key: string]: T }>({});
  const room = useRoom(roomName);

  useEffect(() => {
    if (!room) return;

    const p = room!.presence<T>(key);
    presence.current = p;

    setVal(p.getAll());

    room!.subscribe<T>(p, val => {
      setVal(val);
    });
  }, [room, key]);

  return [val, presence.current];
}
