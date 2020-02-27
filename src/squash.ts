// Lets you combine a whole bunch of variable arguments
// so you can do squash(cursors, gps, dogs, cats, etc)
// and you'll still get solid typing.
// See: https://stackoverflow.com/questions/50729287/varargs-in-typescript
type UnionToIntersection<U> = (U extends any
? (k: U) => void
: never) extends (k: infer I) => void
  ? I
  : never;

export function squash<A extends any[]>(
  ...args: A
): UnionToIntersection<A[number]> {
  // @ts-ignore (we're breaking a bit of typescript here)
  return Object.assign({}, args)!;
}
