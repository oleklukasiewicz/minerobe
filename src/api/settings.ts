import {
  currentUser,
  showToast,
  userSettings,
  wardrobe,
} from "$src/data/cache";
import { MinerobeUserSettings, SkinData } from "$src/data/common";
import { PACKAGE_TYPE } from "$src/data/consts";
import {
  FetchWithTokenAuth,
  GetDocument,
  UpdateDocument,
} from "$src/data/firebase";
import { IsItemIdInWardrobe, IsItemInWardrobe } from "$src/helpers/apiHelper";
import { get } from "svelte/store";

const SETTINS_PATH = "settings";
export const UploadSettings = async function (data: MinerobeUserSettings) {
  await UpdateDocument(SETTINS_PATH, data.userId, data);
};
export const FetchSettings = async function (userId: string) {
  const data = await GetDocument(SETTINS_PATH, userId);
  if (data == null) return new MinerobeUserSettings("", "");
  return data;
};
export const SetCurrentSkin = async function (id, model, texture) {
  const settins = get(userSettings);
  const old = settins.currentSkin;
  settins.currentSkin = new SkinData(id, model, texture);
  await UploadSettings(settins);
  const resp = await FetchWithTokenAuth(
    "/api/service/set_skin/" + id + "/" + model + "/" + get(currentUser).id,
    "GET"
  );
  if (resp.status != 200) {
    settins.currentSkin = old;
    showToast("Failed to change skin", undefined, "error");
  } else {
    showToast("Skin changed");
  }
  userSettings.set(settins);
};
export const UnlinkMinecraftAccount = async function () {
  await FetchWithTokenAuth(
    "/api/internal/unlink/" + get(currentUser).id,
    "GET"
  );
  const settins = get(userSettings);
  settins.linkedMinecraftAccount = null;
  await UploadSettings(settins);
  userSettings.set(settins);
};
export const LinkMinecraftAccount = async function () {
  const resp = await FetchWithTokenAuth(
    "/api/internal/link/" + get(currentUser).id,
    "GET"
  );
  return await resp.json();
};
