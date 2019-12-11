import Automerge, { FreezeObject } from "automerge";
import invariant from "invariant";
import safeJsonStringify from "safe-json-stringify";
import authorize from "./authorize";
import { ROOM_SERICE_SOCKET_URL } from "./core";
import Sockets from "./socket";
import { KeyValueObject } from "./types";

interface RoomValue {
  // Note this MUST be the id, not the reference.
  id: string;
  state: {
    data: string;
  };
}

function fromRoomStr(roomStr: string) {
  return JSON.parse(roomStr) as RoomValue;
}

function asRoomStr(room: RoomValue) {
  return safeJsonStringify(room);
}

const isEmptyObj = (obj: any) =>
  Object.entries(obj).length === 0 && obj.constructor === Object;

export class RoomClient<T extends KeyValueObject> {
  private _socket?: SocketIOClient.Socket;
  private _roomId?: string;
  private readonly _reference: string;
  private readonly _authorizationUrl: string;

  private _onUpdateCallback?: (data: string) => any;
  private _onConnectCallback?: () => any;
  private _onDisconnectCallback?: () => any;

  constructor(authorizationUrl: string, reference: string) {
    this._reference = reference;
    this._authorizationUrl = authorizationUrl;
  }

  async connect() {
    const { room, session } = await authorize(
      this._authorizationUrl,
      this._reference
    );

    this._roomId = room.id;
    this._socket = Sockets.newSocket(ROOM_SERICE_SOCKET_URL, {
      transportOptions: {
        polling: {
          extraHeaders: {
            authorization: "Bearer " + session.token
          }
        }
      }
    });

    /**
     * It's possible someone has created their callbacks BEFORE
     * we've actually connected. In this case, we'll just
     * attach them now.
     */
    if (this._onUpdateCallback) {
      Sockets.on(this._socket, "update_room", this._onUpdateCallback);
    }
    if (this._onConnectCallback) {
      Sockets.on(this._socket, "connect", this._onConnectCallback);
    }
    if (this._onDisconnectCallback) {
      Sockets.on(this._socket, "disconnect", this._onDisconnectCallback);
    }

    /**
     * It's also possible someone's been working offline before we've
     * actually connected to the client. So we should push up their
     * changes.
     */

    // TODO Offline
    // const data = await Offline.get(this._reference);
    // if (data) {
    //   const room: RoomValue = fromRoomStr(data as string);
    //   Sockets.emit(this._socket, "update_room", asRoomStr(room));
    // }
  }

  disconnect() {
    if (this._socket) {
      Sockets.disconnect(this._socket);
    }
  }

  onUpdate(current: FreezeObject<T>, callback: (state: Readonly<T>) => any) {
    invariant(
      !this._onUpdateCallback,
      "It looks like you've called onUpdate multiple times. Since this can cause quite severe performance issues if used incorrectly, we're not currently supporting this behavior. If you've got a use-case we haven't thought of, file a github issue and we may change this."
    );

    const socketCallback = (data: string) => {
      const { id, state } = JSON.parse(data) as RoomValue;

      invariant(
        this._roomId,
        "Expected a _roomId to be defined before we invoked the the onUpdate callback. This is a sign of a broken client, please contact us if you're seeing this."
      );

      // This socket event will fire for ALL rooms, so we need to check
      // if this callback refers to this particular room.
      if (id !== this._roomId) {
        return;
      }

      if (typeof state.data !== "string") {
        throw new Error(
          "The room's state object does not include a string-type 'data' attribute, which could signal a corrupted room. If you're seeing this in production, that's quite bad and represents a fixable bug within the SDK itself. Please let us know and we'll fix it immediately!"
        );
      }

      // Merge! :D
      const newDoc = Automerge.merge(
        current || Automerge.init(),
        Automerge.load(state.data)
      );
      console.log(newDoc);
      callback(newDoc as Readonly<T>);
    };

    // If we're offline, just wait till we're back online to assign this callback
    if (!this._socket) {
      this._onUpdateCallback = socketCallback;
      return;
    }

    Sockets.on(this._socket, "update_room", socketCallback);
  }

  onConnect(callback: () => any) {
    // If we're offline, cue this up for later.
    if (!this._socket) {
      this._onConnectCallback = callback;
      return;
    }

    this._socket.on("connect", callback);
  }

  onDisconnect(callback: () => any) {
    // If we're offline, cue this up for later.
    if (!this._socket) {
      this._onDisconnectCallback = callback;
      return;
    }

    this._socket.on("disconnect", callback);
  }

  publish(current: FreezeObject<T>, callback: (state: T) => void) {
    let doc = current;
    if (!current || isEmptyObj(current)) {
      doc = Automerge.from({} as T);
    }

    const newDoc = Automerge.change(doc, callback);

    // Offline.set(room.reference, asStr); // TODO OFFLINE
    if (this._socket) {
      invariant(
        this._roomId,
        "Expected a _roomId to exist when publishing. This is a sign of a broken client, if you're seeing this, please contact us."
      );

      const room: RoomValue = {
        id: this._roomId as string,
        state: {
          data: Automerge.save(newDoc)
        }
      };

      Sockets.emit(this._socket, "update_room", asRoomStr(room));
    }

    return newDoc;
  }
}

export default class RoomServiceClient {
  private readonly _authorizationUrl: string;

  constructor(authorizationUrl: string) {
    this._authorizationUrl = authorizationUrl;
  }

  room<T extends KeyValueObject>(roomReference: string) {
    return new RoomClient<T>(this._authorizationUrl, roomReference);
  }
}
