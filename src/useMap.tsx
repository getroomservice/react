import { useEffect, useState } from 'react';
import { MapClient } from '@roomservice/browser';
import { useRoom } from './useRoom';
import { useLocalPubSub, useSelf } from './contextForSubscriptions';

export function useMap<T extends any>(
  roomName: string,
  mapName: string
): [MapClient<T> | undefined, (map: MapClient<T>) => any] {
  const [map, setMap] = useState<MapClient<T>>();
  const room = useRoom(roomName);
  const self = useSelf();
  const local = useLocalPubSub();
  const key = 'm' + roomName + mapName;

  useEffect(() => {
    if (!room) return;

    const m = room!.map<T>(mapName);
    setMap(m);

    room!.subscribe(m, next => {
      setMap(next);
    });

    local.subscribe(self, key, list => {
      setMap(list);
    });
  }, [room, mapName]);

  function setAndBroadcast(map: MapClient<T>) {
    setMap(map);
    local.publish(self, key, map);
  }

  return [map, setAndBroadcast];
}
