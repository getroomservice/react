import nock from "nock";
import authorize from "./authorize";

test("Authorization URL is actually called correctly", async () => {
  const AUTHORIZATION_URL = "https://coolsite.com";

  const roomInput = {
    id: "id",
    reference: "my-room",
    state: "{}"
  };

  const scope = nock(AUTHORIZATION_URL)
    .post("/api/roomservice")
    .reply(200, {
      room: roomInput,
      session: {
        token: "short-lived-token"
      }
    });

  const { room, session } = await authorize(
    AUTHORIZATION_URL + "/api/roomservice",
    "my-room"
  );

  expect(scope.isDone()).toBeTruthy();
  expect(session.token).toBe("short-lived-token");
  expect(room).toEqual(roomInput);
});
