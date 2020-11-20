import { useEffect, useState } from 'react';
import { MapClient } from '@roomservice/browser';
import { useRoom } from './useRoom';

type MapObject = { [key: string]: any };

export function useMap<T extends MapObject>(
  roomName: string,
  mapName: string
): [T, MapClient<T> | undefined] {
  const [obj, setObj] = useState<T>({} as T);
  const [map, setMap] = useState<MapClient<T>>();
  const room = useRoom(roomName);

  useEffect(() => {
    if (!room) return;

    const m = room!.map<T>(mapName);
    setObj(m.toObject() as any);
    setMap(m);

    room!.subscribe(m, obj => {
      setObj(obj);
    });
  }, [room, mapName]);

  return [obj, map];
}
