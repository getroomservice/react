import * as React from 'react';
import { ClientProvider } from './contextForClient';
import { RoomServiceParameters } from '@roomservice/browser';

export function RoomServiceProvider(props: {
  children: React.ReactNode;
  clientParameters: RoomServiceParameters<any>;
  //  Whether to authenticate and connect to RoomService infrastructure. Can be
  //  initially set to false to delay authentication until the user is logged in.
  //  Defaults to true.
  online?: boolean;
}) {
  return (
    <ClientProvider
      clientParameters={props.clientParameters}
      online={props.online}
    >
      {props.children}
    </ClientProvider>
  );
}
