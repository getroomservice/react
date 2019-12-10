import invariant from "invariant";
import ky from "ky-universal";

export const ROOM_SERICE_SOCKET_URL = "https://api.roomservice.dev";

export interface RoomValue {
  id: string;
  reference: string;
  name: string;
  state: string;
}

export async function authorize(
  authorizationUrl: string,
  roomReference: string
) {
  // Generates and then records a session cookie.
  const result = await ky.post(authorizationUrl, {
    credentials: "include",
    json: {
      room: {
        reference: roomReference
      }
    }
  });

  invariant(
    result.status !== 405,
    "Your authorization endpoint does not appear to accept a POST request."
  );

  const res = await result.json();
  const { room, session } = res as {
    room: RoomValue;
    session: { token: string };
  };
  return { room, session };
}
