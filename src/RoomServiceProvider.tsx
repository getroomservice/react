import * as React from 'react';
import { ClientProvider } from './contextForClient';
import { RoomServiceParameters } from '@roomservice/browser';

export function RoomServiceProvider(props: {
  children: React.ReactNode;
  clientParameters: RoomServiceParameters<any>;
}) {
  return (
    <ClientProvider clientParameters={props.clientParameters}>
      {props.children}
    </ClientProvider>
  );
}
