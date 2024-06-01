import { GetRequest, PostRequest } from "$src/data/api";
import { MinerobeUserSettings, OutfitPackage } from "$src/data/common";

const SETTINS_PATH = "settings";
export const UploadSettings = async function (data: MinerobeUserSettings) {
  //await UpdateDocument(SETTINS_PATH, data.userId, data);
};
export const FetchSettings = async function () {
  const res = await GetRequest("/api/UserSettings");
  return res;
};
export const UpdateBaseTexture = async function (baseTexture: OutfitPackage) {
  const res = await PostRequest("/api/UserSettings/BaseTexture", baseTexture);
  return res;
};
