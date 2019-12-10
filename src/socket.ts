/**
 * This is just a wrapper around Socket.io that's easier
 * to test.
 */
import IO from "socket.io-client";

// Namespaced so we can mock stuff
class Socket {
  private readonly _socket: SocketIOClient.Socket;
  constructor(url: string, opts: SocketIOClient.ConnectOpts) {
    this._socket = IO(url, opts);
  }

  on(event: "connect" | "disconnect" | "update_room", fn: Function) {
    this._socket.on(event, fn);
  }

  emit(event: "update_room", ...args: any[]) {
    this._socket.emit(event, ...args);
  }
}

export default Socket;
