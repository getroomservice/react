import { useState, useEffect, useRef, useCallback } from 'react';
import { PresenceClient } from '@roomservice/browser';
import { useRoom } from './useRoom';

type UpdateFn<T extends any> = (current?: T) => T;

export interface PresenceUpdater<T extends any> {
  set(valueOrUpdateFn: T | UpdateFn<T>): any;
}

export function usePresence<T extends any>(
  roomName: string,
  key: string
): [{ [key: string]: T }, PresenceUpdater<T>] {
  const presence = useRef<PresenceClient<T>>();
  const [val, setVal] = useState<{ [key: string]: T }>({});
  const room = useRoom(roomName);

  useEffect(() => {
    if (!room) return;

    const p = room!.presence<T>(key);
    presence.current = p;

    // Empty buffer
    if (buffer.current !== undefined) {
      set(buffer.current);
      buffer.current = undefined;
    }

    setVal(p.getAll());

    room!.subscribe<T>(p, val => {
      setVal(val);
    });
  }, [room, key]);

  // a programmer can technically write to the presence key before
  // we connect to the room, this keeps track of that.
  const buffer = useRef<any>(undefined);

  const bufferedSet = useCallback((value: T) => {
    // Buffer before the rooom is open
    if (!presence.current) {
      buffer.current = value;
      return;
    }
    presence.current?.set(value);
  }, []);

  const set = (valueOrUpdateFn: T | UpdateFn<T>) => {
    if (valueOrUpdateFn instanceof Function) {
      bufferedSet(valueOrUpdateFn(presence.current?.my()));
    } else {
      bufferedSet(valueOrUpdateFn);
    }
  };

  //  wrap set method for consistency with Map and List hooks
  return [val, { set }];
}
