import { GetRequest } from "$src/data/api";
import type { MinerobeUserProfile } from "$src/data/common";

export const GetUserProfile = async function (userId: string) {
  const res = await GetRequest("/api/User/" + userId + "/profile");
  return res as MinerobeUserProfile;
};
