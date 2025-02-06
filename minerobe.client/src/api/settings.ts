import { GetRequest, PostRequest } from "$src/data/api";
import type { OutfitPackage } from "$data/models/package";
import type { MinerobeUserSettings } from "$data/models/user";
import type { OutfitPackageExportConfig } from "$src/data/models/render";

export const FetchSettings = async function (): Promise<MinerobeUserSettings> {
  const res = await GetRequest("/api/UserSettings");
  return res;
};
export const GetIntegrationsList = async function () {
  const res = await GetRequest("/api/UserSettings/Integrations");
  return res;
}
export const UpdateBaseTexture = async function (baseTexture: OutfitPackage) {
  const res = await PostRequest("/api/UserSettings/BaseTexture", baseTexture);
  return res;
};
export const SetCurrentTexture = async function (
  config: OutfitPackageExportConfig
) {
  const res = await PostRequest("/api/UserSettings/CurrentSkin/", config);
  return res as MinerobeUserSettings;
};
