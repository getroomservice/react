import { useEffect, useState } from 'react';
import { MapClient } from '@roomservice/browser';
import { useRoom } from './useRoom';

export function useMap<T extends any>(
  roomName: string,
  mapName: string
): [MapClient<T> | undefined, (map: MapClient<T>) => any] {
  const [map, setMap] = useState<MapClient<T>>();
  const room = useRoom(roomName);

  useEffect(() => {
    if (!room) return;

    const m = room!.map<T>(mapName);
    setMap(m);

    room!.subscribe(m, next => {
      setMap(next);
    });
  }, [room, mapName]);

  function setAndBroadcast(map: MapClient<T>) {
    setMap(map);
  }

  return [map, setAndBroadcast];
}
