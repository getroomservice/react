import * as React from 'react';
import { ClientProvider } from './contextForClient';
import { SubscriptionProvider } from './contextForSubscriptions';
import { RoomServiceParameters } from '@roomservice/browser';

export function RoomServiceProvider(props: {
  children: React.ReactNode;
  clientParameters: RoomServiceParameters;
}) {
  return (
    <SubscriptionProvider>
      <ClientProvider clientParameters={props.clientParameters}>
        {props.children}
      </ClientProvider>
    </SubscriptionProvider>
  );
}
