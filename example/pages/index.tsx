import RoomService from "../../dist/client";

const client = new RoomService("http://localhost:3000/api/client");

const myRoom = client.room("my-room");
myRoom.connect();

export default () => {
  return <div>hi</div>;
};
