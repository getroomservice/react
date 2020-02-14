import React from "react";
import RoomServiceClient from "@roomservice/browser";
import { act, renderHook } from "@testing-library/react-hooks";
import { useSharedState, RoomServiceProvider } from "./index";
import { DUMMY_PATH, DUMMY_URL, mockAuthEndpoint } from "./test-util";
import indexedDB from "fake-indexeddb";

test("should call connect and publish", async () => {
  jest.mock("socket.io-client");
  mockAuthEndpoint();
  const client = new RoomServiceClient({
    authUrl: DUMMY_URL + DUMMY_PATH
  });

  const connect = jest.fn();
  const setState = jest.fn();

  // @ts-ignore because we're doing deep mocking magic and typescript
  // is justifiably horrified at our behavior
  jest.spyOn(client, "room").mockImplementation((a, r) => {
    // Mock room class
    return new (class {
      constructor() {}
      async init(...args: any[]) {
        connect(...args);
        return { doc: {} };
      }
      disconnect() {}
      onSetDoc() {}
      onConnect() {}
      onDisconnect() {}
      restore() {}
      async setDoc(...args: any[]) {
        setState(...args);
      }
    })();
  });

  const wrapper = ({ children }: { children: any }) => {
    // @ts-ignore
    window.indexedDB = indexedDB;

    return (
      <RoomServiceProvider authUrl="https://okay.com/hey/there">
        {children}
      </RoomServiceProvider>
    );
  };

  // @ts-ignore "wait" does exist but the typings for the lib are bad
  const { result, wait, waitForNextUpdate } = renderHook(
    () => useSharedState("my-room"),
    {
      // @ts-ignore
      wrapper
    }
  );

  // Can we call setState without problems before
  // we're connected?
  act(() => {
    const [_, setState] = result.current;
    setState((prevState: any) => {
      prevState.value = "literally anything";
    });
  });

  // We're basically just checking that no errors occurred
});
