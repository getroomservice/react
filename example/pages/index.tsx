import { useEffect, useState } from "react";
import RoomService from "../../dist/client";

const client = new RoomService("http://localhost:3000/api/authorize");
const room = client.room("my-room");

export default () => {
  const [isConnected, setIsConnected] = useState();
  const [state, setState] = useState();

  useEffect(() => {
    async function load() {
      room.onConnect(() => {
        setIsConnected(true);
      });

      room.onDisconnect(() => {
        setIsConnected(false);
      });

      room.onUpdate(state, newState => {
        console.log("on update");
        setState(newState);
      });

      await room.connect();
    }

    load();
  }, []);

  function onPush() {
    const newValue = room.publish(state, prevState => {
      prevState.value = `${Math.random() * 100}`;
    });
    setState(newValue);
  }

  return (
    <div>
      <p>
        {isConnected ? "connected" : "waiting..."} {state && state.value}
      </p>

      <button onClick={onPush}>press me</button>
    </div>
  );
};
