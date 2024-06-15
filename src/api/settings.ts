import { GetRequest, PostRequest } from "$src/data/api";
import type { OutfitPackage } from "$src/model/package";
import type { MinerobeUserSettings } from "$src/model/user";

export const FetchSettings = async function () {
  const res = await GetRequest("/api/UserSettings/Simple");
  return res;
};
export const UpdateBaseTexture = async function (baseTexture: OutfitPackage) {
  const res = await PostRequest("/api/UserSettings/BaseTexture", baseTexture);
  return res;
};
export const SetCurrentTexture = async function (packageId: string) {
  const res = await PostRequest(
    "/api/UserSettings/CurrentTexture/" + packageId,
    {}
  );
  return res as MinerobeUserSettings;
};
