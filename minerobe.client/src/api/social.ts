import { PostRequest } from "$src/data/api";
import type { PackageSocialData } from "$data/models/package";

export const SharePackage = async function (socialId: string) {
  const resp = await PostRequest("/api/Social/Share/" + socialId, {});
  return resp as PackageSocialData;
};
export const UnSharePackage = async function (socialId: string) {
  const resp = await PostRequest("/api/Social/UnShare/" + socialId, {});
  return resp as PackageSocialData;
};
export const SetAsDownloadPackage = async function (socialId: string) {
  const resp = await PostRequest("/api/Social/Download/" + socialId, {});
  return resp as PackageSocialData; 
};
