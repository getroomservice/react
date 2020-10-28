/**
 * Occurs if the programmer uses a hook in a component that doesn't
 * have the RoomServiceProvider as an ancestor.
 */
export const errOutsideOfProvider = () =>
  new Error(
    'A hook is being used outside the RoomServiceProvider. Learn more: https://err.sh/getroomservice/react/no-provider'
  );
