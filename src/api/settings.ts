import { currentUser, userSettings } from "$src/data/cache";
import { MinerobeUserSettings, SkinData } from "$src/data/common";
import { GetDocument, UpdateDocument } from "$src/data/firebase";
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
export const SetCurrentSkin = function (id, model, texture) {
  const settins = get(userSettings);
  settins.currentSkin = new SkinData(id, model, texture);
  UploadSettings(settins);
};
