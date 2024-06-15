import { get } from "svelte/store";
import { currentUser } from "../data/cache";
import {
  GetRequest,
  PutRequest,
  getAuthUser,
  getCurrentUserFromLocal,
  login,
  logout,
} from "../data/api";
import type { MinerobeUser } from "$src/model/user";

export const getCurrentUser = async function () {
  await getCurrentUserFromLocal();
  const firebaseUser = getAuthUser();
  if (firebaseUser) {
    const minerobeUser = await GetRequest("/api/User/Login");
    currentUser.set(minerobeUser);
  } else {
    currentUser.update((user) => {
      return undefined;
    });
  }
};
export const loginUser = async function () {
  const user = await login();
  const minerobeUser = await GetRequest("/api/User/Login");
  currentUser.set(minerobeUser);
};
export const logoutUser = async function () {
  await logout();
  currentUser.set(null);
};

export const SetMinerobeUser = async function (user: MinerobeUser) {
  if (get(currentUser) && user != null) {
    return await PutRequest("/api/User/" + user.id, user);
  }
};
export const GetMinerobeUser = async function (id: string) {
  if (id == get(currentUser)?.id) return get(currentUser);
  return await GetRequest("/api/User/" + id);
};
