import Automerge from "automerge";
import { useEffect, useState } from "react";
import safeJsonStringify from "safe-json-stringify";
import Socket from "socket.io-client";
import { authorize, ROOM_SERICE_SOCKET_URL } from "./core";
import useAutomerge from "./useAutomerge";

export function useInternalHook<T extends object>(
  reference: string,
  authorizationUrl: string,
  defaultState?: T
): [T, (cb: (prevState: T) => void) => any, boolean] {
  const [doc, changeDoc, loadDoc] = useAutomerge(defaultState || {});
  const [isConnected, setIsConnected] = useState();
  const [socket, setSocket] = useState<SocketIOClient.Socket>();
  const [room, setRoom] = useState();

  async function load() {
    const { room, session } = await authorize(authorizationUrl, reference);

    const socket = Socket(ROOM_SERICE_SOCKET_URL, {
      transportOptions: {
        polling: {
          extraHeaders: {
            authorization: "Bearer " + session.token
          }
        }
      }
    });

    // Set our initial state
    setRoom(room);
    loadDoc(JSON.parse(room.state).data);

    socket.on("update_room", (roomStr: string) => {
      const { id, state } = JSON.parse(roomStr);

      // It's possible to be subscribed to multiple rooms
      // so this keeps our rooms state seperate
      if (id !== room.id) {
        return;
      }

      loadDoc(state.data);
    });

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(socket);
  }

  function emit(cb: (prevState: T) => void) {
    // TODO: save offline
    if (!socket) {
      return; // for the moment do nothing
    }

    const newDoc = changeDoc(cb);

    socket.emit(
      "update_room",
      safeJsonStringify({
        state: {
          data: Automerge.save(newDoc)
        },
        id: room.id
      })
    );
  }

  useEffect(() => {
    load();
  }, [reference]);

  return [doc, emit, isConnected];
}

export default function init({
  authorizationUrl
}: {
  authorizationUrl: string;
}) {
  function useRoom<T extends Object>(reference: string, defaultState?: T) {
    return useInternalHook<T>(reference, authorizationUrl, defaultState);
  }

  return {
    useRoom
  };
}
