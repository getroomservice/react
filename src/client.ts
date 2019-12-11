import Automerge, { FreezeObject } from "automerge";
import invariant from "invariant";
import safeJsonStringify from "safe-json-stringify";
import authorize from "./authorize";
import { ROOM_SERICE_SOCKET_URL } from "./core";
import Sockets from "./socket";
import { KeyValueObject } from "./types";

interface RoomValue {
  reference: string;
  state: {
    data: string;
  };
}

const isEmptyObj = (obj: any) =>
  Object.entries(obj).length === 0 && obj.constructor === Object;

export class RoomClient<T extends KeyValueObject> {
  private _socket: SocketIOClient.Socket;
  private _reference: string;

  constructor(socket: SocketIOClient.Socket, reference: string) {
    invariant(socket, "Expected a socket client to be defined");

    this._socket = socket;
    this._reference = reference;
  }

  onUpdate(callback: (state: Readonly<T>) => any) {
    this._socket.on("update_room", (data: string) => {
      const { reference, state } = JSON.parse(data) as RoomValue;

      // This socket event will fire for ALL rooms, so we need to check
      // if this callback refers to this particular room.
      if (reference !== this._reference) {
        return;
      }

      if (typeof state.data !== "string") {
        throw new Error(
          "The room's state object does not include a string-type 'data' attribute, which could signal a corrupted room. If you're seeing this in production, that's quite bad and represents a fixable bug within the SDK itself. Please let us know and we'll fix it immediately!"
        );
      }

      callback(Automerge.load(state.data) as Readonly<T>);
    });
  }

  onConnect(callback: () => any) {
    this._socket.on("connect", callback);
  }

  onDisconnect(callback: () => any) {
    this._socket.on("disconnect", callback);
  }

  publish(current: Readonly<T>, callback: (state: T) => void) {
    let doc = current as FreezeObject<T>;
    if (!current || isEmptyObj(current)) {
      doc = Automerge.from({} as T);
    }

    const newDoc = Automerge.change(doc, callback);

    const room: RoomValue = {
      reference: this._reference,
      state: {
        data: Automerge.save(newDoc)
      }
    };

    this._socket.emit("update_room", safeJsonStringify(room));
    return newDoc;
  }
}

export default class RoomServiceClient {
  private readonly _authorizationUrl: string;

  constructor(authorizationUrl: string) {
    this._authorizationUrl = authorizationUrl;
  }

  async room<T extends KeyValueObject>(roomReference: string) {
    const { room, session } = await authorize(
      this._authorizationUrl,
      roomReference
    );

    return new RoomClient<T>(
      Sockets.newSocket(ROOM_SERICE_SOCKET_URL, {
        transportOptions: {
          polling: {
            extraHeaders: {
              authorization: "Bearer " + session.token
            }
          }
        }
      }),
      roomReference
    );
  }
}
