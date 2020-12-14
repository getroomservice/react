import { useState, useEffect, useRef, useCallback } from 'react';
import { PresenceClient } from '@roomservice/browser';
import { useRoom } from './useRoom';

export function usePresence<T extends any>(
  roomName: string,
  key: string
): [{ [key: string]: T }, PresenceClient<T>] {
  const presence = useRef<PresenceClient<T>>();
  const [val, setVal] = useState<{ [key: string]: T }>({});
  const room = useRoom(roomName);

  useEffect(() => {
    if (!room) return;

    const p = room!.presence<T>(key);
    presence.current = p;

    // Empty buffer
    if (buffer.current !== undefined) {
      presence.current.set(buffer.current[0], buffer.current[1]);
      buffer.current = undefined;
    }

    setVal(p.getAll());

    const subscription = room!.subscribe<T>(p, val => {
      setVal(val);
    });

    return () => room!.unsubscribe(subscription);
  }, [room, key]);

  // a programmer can technically write to the presence key before
  // we connect to the room, this keeps track of that.
  const buffer = useRef<[T, number?] | undefined>(undefined);

  const bufferedSet = useCallback((value: T, expiresAfter?: number): any => {
    // Buffer before the room is open
    if (!presence.current) {
      buffer.current = [value, expiresAfter];
      return;
    }
    presence.current?.set(value);
  }, []);

  return [
    val,
    {
      set: bufferedSet,
      getMine: () => {
        return presence.current?.getMine();
      },
      getAll: () => {
        return presence.current?.getAll() ?? {};
      },
    },
  ];
}
