import * as React from 'react';
import { useRef, createContext, useContext } from 'react';

interface SubscriptionContext {
  subscribe: (event: string, callback: (arg: any) => any) => any;
  publish: (event: string, data: any) => any;
}

export const subscriptionContext = createContext<SubscriptionContext>(
  {} as any
);

export function useLocalPubSub() {
  return useContext(subscriptionContext);
}

export function SubscriptionProvider(props: { children: React.ReactNode }) {
  const ref = useRef<any>({
    subs: {},
  });

  function subscribe(event: string, callback: Function) {
    if (!Array.isArray(ref.current.subs[event])) {
      ref.current!.subs[event] = [];
    }
    ref.current!.subs[event].push(callback);
  }

  function publish(event: string, data: any) {
    if (!Array.isArray(ref.current.subs[event])) return;
    for (let fn of ref.current.subs[event]) fn(data);
  }

  return (
    <subscriptionContext.Provider value={{ subscribe, publish }}>
      {props.children}
    </subscriptionContext.Provider>
  );
}
