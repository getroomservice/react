import * as React from 'react';
import {
  RoomClient,
  RoomService,
  RoomServiceParameters,
} from '@roomservice/browser';
import { createContext, ReactNode, useRef } from 'react';

interface ClientContext {
  addRoom?: (key: string) => Promise<RoomClient>;
}

export const clientContext = createContext<ClientContext>({});

export function ClientProvider({
  children,
  clientParameters,
}: {
  children: ReactNode;
  clientParameters: RoomServiceParameters<any>;
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
    <clientContext.Provider
      value={{
        addRoom,
      }}
    >
      {children}
    </clientContext.Provider>
  );
}
