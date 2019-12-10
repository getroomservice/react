import { act, renderHook } from "@testing-library/react-hooks";
import Automerge from "automerge";
import useAutomerge from "./useAutomerge";

test("should be able to load a doc", () => {
  const { result } = renderHook(() => useAutomerge({ value: "before" }));

  act(() => {
    const [_, __, load] = result.current;
    load(Automerge.save(Automerge.from({ value: "after" })));
  });

  expect(result.current[0].value).toBe("after");
});
