import { get } from "svelte/store";
import { currentUser } from "../data/cache";
import {
  GenerateIdForCollection,
  GetDocument,
  GetUser,
  SetDocument,
  login,
  logout,
} from "../data/firebase";
import { MinerobeUser, MinerobeUserLink } from "$src/data/common";

const USER_PATH = "users";
const USER_LINK_PATH = "user-link";

export const loginUser = async function () {
  let user = await login();
  let firebaseUser = GetUser();
  let minerobeUser:MinerobeUser;
  let minerobeUserLink:MinerobeUserLink = await GetDocument(USER_LINK_PATH, firebaseUser.uid);
  if (minerobeUserLink) {
    minerobeUser = await GetDocument(USER_PATH, minerobeUserLink.userId);
  }
  else {
    minerobeUser = await createUser(user);
  }

  currentUser.set(minerobeUser);
};
export const logoutUser = async function () {
  await logout();
  currentUser.set(null);
};
const createUser = async function (user: any):Promise<MinerobeUser> {
  const userID = GenerateIdForCollection(USER_PATH);
  await SetDocument(USER_LINK_PATH,user.uid, new MinerobeUserLink(user.uid,userID));
  const userImg = await fetch(user.photoURL);
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
  if (get(currentUser)) return await GetDocument(USER_PATH, id);
};
