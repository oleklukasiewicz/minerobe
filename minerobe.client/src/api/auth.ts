import { get } from "svelte/store";
import {
  GetRequest,
  PutRequest,
  getAuthUser,
  getCurrentUserFromLocal,
  login,
  logout,
} from "../data/api";
import type { MinerobeUser } from "$src/model/user";
import { currentUserWritable } from "$src/data/static";

export const getCurrentUser = async function () {
  await getCurrentUserFromLocal();
  const firebaseUser = getAuthUser();
  if (firebaseUser) {
    const minerobeUser = await GetRequest("/api/User/Login");
    currentUserWritable.set(minerobeUser);
  } else {
    currentUserWritable.update((user) => {
      return undefined;
    });
  }
};
export const loginUser = async function () {
  const user = await login();
  const minerobeUser = await GetRequest("/api/User/Login");
  currentUserWritable.set(minerobeUser);
};
export const logoutUser = async function () {
  await logout();
  currentUserWritable.set(null);
};

export const SetMinerobeUser = async function (user: MinerobeUser) {
  if (get(currentUserWritable) && user != null) {
    return await PutRequest("/api/User/" + user.id, user);
  }
};
export const GetMinerobeUser = async function (id: string) {
  if (id == get(currentUserWritable)?.id) return get(currentUserWritable);
  return await GetRequest("/api/User/" + id);
};
