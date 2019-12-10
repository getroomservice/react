import nock from "nock";
import RoomServiceClient from "./client";

const URL = "https://coolsite.com";

function mockAuthEndpoint() {
  return nock(URL)
    .post("/api/roomservice")
    .reply(200, {
      room: {
        id: "id",
        reference: "my-room",
        state: "{}"
      },
      session: {
        token: "short-lived-token"
      }
    });
}

describe("RoomServiceClient", () => {
  const scope = mockAuthEndpoint();

  it("should call the authorization endpoint when creating a room", async () => {
    const client = new RoomServiceClient(URL + "/api/roomservice");
    await client.room("my-room");

    expect(scope.isDone()).toBeTruthy();
  });

  test("room()", async () => {
    mockAuthEndpoint();

    const client = new RoomServiceClient(URL + "/api/roomservice");
    const room = await client.room("my-room");

    room.publish({}, prevState => {
      prevState.someOption = "hello!";
    });
  });
});
