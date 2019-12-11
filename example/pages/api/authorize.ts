import RoomService from "@roomservice/node";
import { NextApiRequest, NextApiResponse } from "next";

const API_KEY = "sk_test_oY22BhrxUvJHqSmCqQ9wg";

const client = new RoomService(API_KEY);

export default (req: NextApiRequest, res: NextApiResponse) => {
  const { room } = client.parse(req.body);

  return client.authorize(res, {
    guest: "someone",
    room: room.reference
  });
};
