import { useState, useEffect, useRef, useCallback } from 'react';
import { PresenceClient } from '@roomservice/browser';
import { useRoom } from './useRoom';

//TODO: allow returning undefined?
type UpdateFn<T extends any> = (current: T | undefined) => T;
export interface PresenceUpdater<T extends any> {
  set(valueOrUpdateFn: T | UpdateFn<T>): any;
}

export function usePresence<T extends any>(
  roomName: string,
  key: string
): [{ [key: string]: T }, PresenceUpdater<T>] {
  const presence = useRef<PresenceClient>();
  const [val, setVal] = useState<{ [key: string]: T }>({});
  const room = useRoom(roomName);

  useEffect(() => {
    if (!room) return;

    const p = room!.presence();
    presence.current = p;

    // Empty buffer
    if (buffer.current !== undefined) {
      set(buffer.current);
      buffer.current = undefined;
    }

    p.getAll<T>(key).then(val => {
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
  const bufferedSet = useCallback((value: T) => {
    // Buffer before the rooom is open
    if (!presence.current) {
      buffer.current = value;
      return;
    }
    presence.current?.set(key, value);
  }, []);

  const set = (valueOrUpdateFn: T | UpdateFn<T>) => {
    if (valueOrUpdateFn instanceof Function) {
      bufferedSet(valueOrUpdateFn(val && room && val[room.me]));
    } else {
      bufferedSet(valueOrUpdateFn);
    }
  };

  //  wrap set method for consistency with Map and List hooks
  return [val, { set }];
}
