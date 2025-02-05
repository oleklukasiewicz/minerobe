import { GetRequest, PostRequest, PutRequest } from "$src/data/api";
import type { MinerobeUser, MinerobeUserProfile } from "$data/models/user";
import { CURRENT_USER, currentUserWritable } from "$src/data/static";
import { get } from "svelte/store";

export const GetUserProfile = async function (userId: string) {
  const res = await GetRequest("/api/User/" + userId + "/profile");
  return res as MinerobeUserProfile;
};
export const UpdateUser = async function (userProfile: MinerobeUser) {
  const res = await PutRequest(`/api/User`, userProfile);
  if (res.id == get(CURRENT_USER)?.id) currentUserWritable.set(res);
  return res;
};
export const ResetUserAvatar = async function () {
  const res = await PostRequest(`/api/User/resetAvatar`, {});
  if (res.id == get(CURRENT_USER)?.id) currentUserWritable.set(res);
  return res;
};
