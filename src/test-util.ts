import nock from "nock";

export const DUMMY_PATH = "/api/roomservice";
export const DUMMY_URL = "https://coolsite.com";
export const DUMMY_ROOM = {
  id: "id",
  reference: "my-room",
  state: "{}"
};

export const DUMMY_SESSION = {
  token: "short-lived-token"
};

export function mockAuthEndpoint() {
  return nock(DUMMY_URL)
    .post(DUMMY_PATH)
    .reply(200, {
      room: DUMMY_ROOM,
      session: DUMMY_SESSION
    });
}
