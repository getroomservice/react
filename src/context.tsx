import * as React from 'react';
import { RoomClient, RoomService } from '@roomservice/browser';
import { createContext, ReactNode, useRef } from 'react';
import { RoomServiceParameters } from '@roomservice/browser/dist/RoomServiceClient';

interface RoomServiceContext {
  rooms: { [key: string]: RoomClient };
  addRoom?: (key: string) => Promise<RoomClient>;
}

export const context = createContext<RoomServiceContext>({
  rooms: {},
});

export function RoomServiceProvider({
  children,
  clientParameters,
}: {
  children: ReactNode;
  clientParameters: RoomServiceParameters;
}) {
  const rs = new RoomService(clientParameters);
  // ref instead of state here to prevent a double render
  const ref = useRef<{ [key: string]: RoomClient }>({});

  async function addRoom(key: string) {
    const room = await rs.room(key);
    ref.current[key] = room;
    return room;
  }

  return (
    <context.Provider
      value={{
        rooms: ref.current,
        addRoom,
      }}
    >
      {children}
    </context.Provider>
  );
}
