import { GetRequest, PutRequest } from "$src/data/api";
import type { MinerobeUser, MinerobeUserProfile } from "$data/models/user";

export const GetUserProfile = async function (userId: string) {
  const res = await GetRequest("/api/User/" + userId + "/profile");
  return res as MinerobeUserProfile;
};
export const UpdateUserProfile =async function (userProfile: MinerobeUser) {
  const res = await PutRequest(`/api/User/${userProfile.id}`, userProfile);
  return res;
}