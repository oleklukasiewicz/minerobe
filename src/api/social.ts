import { PostRequest } from "$src/data/api";

export const SharePackage = async function (socialId: string) {
  const resp = await PostRequest("/api/Social/Share/" + socialId, {});
  return resp;
};
export const UnSharePackage = async function (socialId: string) {
  const resp = await PostRequest("/api/Social/UnShare/" + socialId, {});
  return resp;
};
export const SetAsDownloadPackage = async function (socialId: string) {
  const resp = await PostRequest("/api/Social/Download/" + socialId, {});
  return resp;
};
