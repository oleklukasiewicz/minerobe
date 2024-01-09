import { get } from "svelte/store";
import { currentUser, userSettings } from "../data/cache";
import {
  GenerateIdForCollection,
  GetDocument,
  GetUser,
  SetDocument,
  getCurrentUserFromLocal,
  login,
  logout,
} from "../data/firebase";
import { MinerobeUser, MinerobeUserLink, MinerobeUserSettings } from "$src/data/common";

const USER_PATH = "users";
const USER_LINK_PATH = "user-link";

export const getCurrentUser = async function () {
  await getCurrentUserFromLocal();
  let firebaseUser = GetUser();
  let minerobeUser: MinerobeUser;
  if (firebaseUser) {
    let minerobeUserLink: MinerobeUserLink = await GetDocument(
      USER_LINK_PATH,
      firebaseUser.uid
    );
    if (minerobeUserLink) {
      minerobeUser = await GetDocument(USER_PATH, minerobeUserLink.userId);
    }
    currentUser.set(minerobeUser);
  } else {
    currentUser.update((user) => {
      return undefined;
    });
  }
};
export const loginUser = async function () {
  let user = await login();
  let firebaseUser = GetUser();
  let minerobeUser: MinerobeUser;
  let minerobeUserLink: MinerobeUserLink = await GetDocument(
    USER_LINK_PATH,
    firebaseUser.uid
  );
  minerobeUser = minerobeUserLink
    ? await GetDocument(USER_PATH, minerobeUserLink.userId)
    : await createUser(user);

  currentUser.set(minerobeUser);
};
export const logoutUser = async function () {
  await logout();
  currentUser.set(null);
  userSettings.set(new MinerobeUserSettings(null,null,null));
};
const createUser = async function (user: any): Promise<MinerobeUser> {
  const userID = GenerateIdForCollection(USER_PATH);
  await SetDocument(
    USER_LINK_PATH,
    user.uid,
    new MinerobeUserLink(user.uid, userID)
  );
  const userImg = await fetch(user.photoURL, { referrerPolicy: "no-referrer" });
  const userImgBlob = await userImg.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = function () {
      const base64data = reader.result;
      const newUser = new MinerobeUser(
        userID,
        user.displayName,
        base64data as string
      );
      SetDocument(USER_PATH, userID, newUser);
      resolve(newUser);
    };
    reader.onerror = reject;
    reader.readAsDataURL(userImgBlob);
  });
};
export const SetMinerobeUser = async function (user: MinerobeUser) {
  if (get(currentUser) && user != null) {
    return await SetDocument(USER_PATH, get(currentUser).id, user);
  }
};
export const GetMinerobeUser = async function (id: string) {
  return await GetDocument(USER_PATH, id);
};
