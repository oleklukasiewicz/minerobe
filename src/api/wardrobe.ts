import { DeleteRequest, GetRequest, PostRequest } from "$src/data/api";
import { currentUser } from "$src/data/cache";
import type {
  OutfitPackage,
  WardrobePackage,
  WardrobePagedResponse,
} from "$src/data/common";
import { get } from "svelte/store";

export const AddPackageToWardrobe = async function (packageId: string) {
  const resp = await PostRequest(
    "/api/Wardrobe/" + get(currentUser)?.id + "/" + packageId + "/byUser",
    {}
  );
  return resp;
};
export const RemovePackageFromWardrobe = async function (packageId: string) {
  const resp = await DeleteRequest(
    "/api/Wardrobe/" + get(currentUser)?.id + "/" + packageId + "/byUser"
  );
  return resp;
};
export const GetStudioPackage = async function () {
  const req = await GetRequest(
    "/api/Wardrobe/" + get(currentUser).id + "/studio"
  );
  const st = req as OutfitPackage;
  return st;
};
export const GetUserWardrobe = async function () {
  const req = await GetRequest("/api/Wardrobe/" + get(currentUser).id);
  const st = req as WardrobePackage;
  return st;
};
export const SetStudioPackage = async function (packageId: string) {
  const resp = await PostRequest(
    "/api/Wardrobe/" + get(currentUser)?.id + "/studio/" + packageId,
    {}
  );
  return resp;
};
export const GetWardrobePackages = async function (
  type: string = null,
  outfitType: string = null,
  phrase: string = "",
  page: number = 1,
  pageSize: number = -1
) {
  const req = (await PostRequest(
    "/api/Wardrobe/" + get(currentUser)?.id + "/items",
    {
      page,
      pageSize,
      filter: {
        type,
        outfitType,
        phrase,
      },
    }
  )) as WardrobePagedResponse;
  return req;
};
export const GetWadrobeSummary = async function () {
  const req = await GetRequest("/api/Wardrobe/" + get(currentUser).id + "/summary");
  return req;
};