import Automerge from "automerge";
import { useState } from "react";

export default function useAutomerge(
  initialState: object | string
): [any, (cb: (prev: any) => any) => any, (s: string) => void] {
  const [doc, setDoc] = useState(
    typeof initialState === "string"
      ? Automerge.load(initialState)
      : Automerge.from(initialState)
  );

  function change(cb: (prev: any) => any) {
    const newDoc = Automerge.change(doc, cb);
    setDoc(newDoc);
    return newDoc;
  }

  function load(str: string) {
    try {
      const dc = Automerge.load(str);
      setDoc(dc);
    } catch (err) {
      console.error("ERROR", err, str);
    }
  }

  return [doc, change, load];
}
