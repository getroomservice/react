import React from "react";
import { createContext } from "react";
import RoomService from "@roomservice/browser";

interface RoomServiceProps {
  authUrl: string;
  children: React.ReactNode;
}

type MaybeRoomService = RoomService | false;
export const RoomServiceContext = createContext<MaybeRoomService>(false);

export const RoomServiceProvider = (props: RoomServiceProps) => {
  if (!props.authUrl) {
    throw new Error("The RoomServiceProvider must have an authUrl prop.");
  }

  const client = new RoomService({
    authUrl: props.authUrl
  });

  return (
    <RoomServiceContext.Provider value={client}>
      {props.children}
    </RoomServiceContext.Provider>
  );
};
