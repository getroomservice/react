import invariant from "invariant";
import ky from "ky-universal";

interface RoomValue {
  id: string;
  reference: string;
  state: string;
}

export default async function authorize(
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
    },
    throwHttpErrors: false
  });

  // This is just user error, so it's probably fine to throw here.
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
