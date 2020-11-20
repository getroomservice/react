import { useState, useEffect, useRef, useCallback } from 'react';
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

    const p = room!.presence(key);
    presence.current = p;

    // Empty buffer
    if (buffer.current !== undefined) {
      set(buffer.current);
      buffer.current = undefined;
    }

    p.getAll<T>().then(val => {
      setVal(val);
    });

    room!.subscribe<T>(p, key, val => {
      setVal(val);
    });
  }, [room, key]);

  // a programmer can technically write to the presence key before
  // we connect to the room, this keeps track of that.
  const buffer = useRef<any>(undefined);

  //TODO: batch calls to this function before presence is ready
  const set = useCallback((value: T) => {
    // Buffer before the rooom is open
    if (!presence.current) {
      buffer.current = value;
      return;
    }
    presence.current?.set(value);
  }, []);

  return [val, set];
}
