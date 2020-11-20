import { useRoom } from './useRoom';
import { ListClient } from '@roomservice/browser';
import { useState, useEffect } from 'react';

export function useList<T extends Array<any>>(
  roomName: string,
  listName: string
): [T, ListClient<T> | undefined] {
  const [obj, setObj] = useState<T>({} as T);
  const [list, setList] = useState<ListClient<T>>();
  const room = useRoom(roomName);

  useEffect(() => {
    if (!room) return;

    const l = room.list<T>(listName);
    setObj(l.toArray() as any);
    setList(l);

    room.subscribe(l, next => {
      setObj(next);
    });
  }, [room, listName]);

  return [obj || [], list];
}
