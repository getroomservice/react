import React, { useState, useEffect } from "react";
import { createContext } from "react";
import RoomService from "@roomservice/browser";

interface RoomServiceProps {
  authUrl: string;
  headers?: Headers;
  children: React.ReactNode;
}

type MaybeRoomService = RoomService | false;
export const RoomServiceContext = createContext<MaybeRoomService>(false);

export const RoomServiceProvider = (props: RoomServiceProps) => {
  if (!props.authUrl) {
    throw new Error("The RoomServiceProvider must have an authUrl prop.");
  }

  const [client] = useState<RoomService>(
    // Using this format to ensure there's only one client created
    () =>
      new RoomService({
        authUrl: props.authUrl,
        headers: props.headers
      })
  );

  return (
    <RoomServiceContext.Provider value={client}>
      {props.children}
    </RoomServiceContext.Provider>
  );
};
