import * as React from 'react';
import { RoomClient, RoomService } from '@roomservice/browser';
import { createContext, ReactNode, useRef } from 'react';
import { RoomServiceParameters } from '@roomservice/browser/dist/RoomServiceClient';

interface RoomServiceContext {
  addRoom?: (key: string) => Promise<RoomClient>;
}

export const context = createContext<RoomServiceContext>({
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
  //  and allow delayed initialization
  const pendingRef = useRef<{ [key: string]: Promise<RoomClient> }>({});

  async function addRoom(key: string) {
    //  Make sure rs.room is only ever called once per room
    if (!pendingRef.current[key]) {
      pendingRef.current[key] = rs.room(key);
    }
    const room = await pendingRef.current[key];
    return room;
  }

  return (
    <context.Provider
      value={{
        addRoom,
      }}
    >
      {children}
    </context.Provider>
  );
}
