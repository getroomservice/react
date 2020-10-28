import { useRoom } from './useRoom';
import { ListClient } from '@roomservice/browser';
import { useState, useEffect } from 'react';
import { useLocalPubSub } from './contextForSubscriptions';

export function useList<T extends any>(
  roomName: string,
  listName: string
): [ListClient<T> | undefined, (list: ListClient<T>) => any] {
  const [list, setList] = useState<ListClient<T>>();
  const room = useRoom(roomName);
  const local = useLocalPubSub();
  const key = roomName + listName;

  useEffect(() => {
    if (!room) return;

    const l = room.list<T>(listName);
    setList(l);

    room.subscribe(l, next => {
      setList(next);
    });

    local.subscribe(key, list => {
      setList(list);
    });
  }, [room, listName]);

  function setAndBroadcastList(list: ListClient<T>) {
    setList(list);
    local.publish(key, list);
  }

  return [list, setAndBroadcastList];
}
