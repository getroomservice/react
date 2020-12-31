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
  online,
}: {
  children: ReactNode;
  clientParameters: RoomServiceParameters<any>;
  online?: boolean;
}) {
  const rs = useRef<RoomService<any> | undefined>();

  const delayedInitClientTriggers = useRef<Array<() => void>>([]);
  if (online === undefined || online === true) {
    rs.current = new RoomService(clientParameters);
    for (const trigger of delayedInitClientTriggers.current) {
      trigger();
    }
    delayedInitClientTriggers.current = [];
  }

  // ref instead of state here to prevent a double render
  //  and allow delayed initialization
  const pendingRef = useRef<{ [key: string]: Promise<RoomClient> }>({});

  async function addRoom(key: string): Promise<RoomClient> {
    //  Make sure rs.room is only ever called once per room
    if (!pendingRef.current[key]) {
      if (rs.current === undefined) {
        const { trigger, promise } = triggeredPromise();
        delayedInitClientTriggers.current.push(trigger);
        pendingRef.current[key] = promise.then(() => rs.current!.room(key));
      } else {
        pendingRef.current[key] = rs.current.room(key);
      }
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

function triggeredPromise(): {
  trigger: () => void;
  promise: Promise<void>;
} {
  let trigger: (_: any) => void;
  const triggerPromise = new Promise<void>(resolve => {
    trigger = resolve;
  });

  return { trigger: trigger! as () => void, promise: triggerPromise };
}
