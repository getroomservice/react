import * as React from 'react';
import { useRef, createContext, useContext } from 'react';

type Instance = Symbol;

/**
 * Returns a unique reference to the calling component
 * via a Symbol
 */
export function useSelf(): Instance {
  const ref = useRef(Symbol('self'));
  return ref.current;
}

interface SubscriptionContext {
  subscribe: (
    actor: Instance,
    event: string,
    callback: (arg: any) => any
  ) => any;
  publish: (actor: Instance, event: string, data: any) => any;
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

  function subscribe(actor: Instance, event: string, callback: Function) {
    if (!Array.isArray(ref.current.subs[event])) {
      ref.current!.subs[event] = [];
    }
    ref.current!.subs[event].push((a: Instance, data: any) => {
      if (a === actor) return; // don't listen to ourselves
      callback(data);
    });
  }

  function publish(actor: Instance, event: string, data: any) {
    if (!Array.isArray(ref.current.subs[event])) return;
    for (let fn of ref.current.subs[event]) fn(actor, data);
  }

  return (
    <subscriptionContext.Provider value={{ subscribe, publish }}>
      {props.children}
    </subscriptionContext.Provider>
  );
}
