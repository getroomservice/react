import { act, renderHook } from "@testing-library/react-hooks";
import RoomServiceClient from "./client";
import { useRoomService } from "./index";

test("should be able to load a doc", () => {
  const client = new RoomServiceClient("https://coolsite.com/api/authorize");
  const { result } = renderHook(() => useRoomService(client, "my-room"));

  act(() => {
    const [_, setState] = result.current;
    setState(prevState => {
      prevState.value = "after";
    });
  });

  expect(result.current[0].value).toBe("after");
});
