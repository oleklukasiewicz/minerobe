import { DeleteRequest, GetRequest, PostRequest } from "$src/data/api";
import { currentUser } from "$src/data/cache";
import type { PagedResponse } from "$src/model/base";
import type { OutfitFilter } from "$src/model/filter";
import type { WardrobePackage } from "$src/model/wadrobe";
import { get } from "svelte/store";

export const AddPackageToWardrobe = async function (packageId: string) {
  const resp = await PostRequest(
    "/api/Wardrobe/" + get(currentUser)?.wardrobeId + "/" + packageId,
    {}
  );
  return resp;
};
export const RemovePackageFromWardrobe = async function (packageId: string) {
  const resp = await DeleteRequest(
    "/api/Wardrobe/" + get(currentUser)?.wardrobeId + "/" + packageId 
  );
  return resp;
};
export const GetUserWardrobe = async function () {
  const req = await GetRequest("/api/Wardrobe/" + get(currentUser).wardrobeId);
  const st = req as WardrobePackage;
  return st;
};
export const GetWardrobePackages = async function (
  filter: OutfitFilter,
  page: number = 0,
  pageSize: number = -1
) {
  const req = (await PostRequest(
    "/api/Wardrobe/" + get(currentUser)?.wardrobeId + "/items",
    {
      page,
      pageSize,
      filter,
    }
  )) as PagedResponse;
  return req;
};
export const GetWadrobeCollections = async function (
  phrase: string = "",
  page: number = 0,
  pageSize: number = -1
) {
  const req = (await PostRequest(
    "/api/Wardrobe/" + get(currentUser)?.wardrobeId + "/collections",
    {
      page,
      pageSize,
      filter: {
        phrase,
      },
    }
  )) as PagedResponse;
  return req;
};
export const GetWadrobeCollectionsWithPackageContext = async function (
  packageId: string,
  phrase: string = "",
  page: number = 0,
  pageSize: number = -1
) {
  const req = (await PostRequest(
    "/api/Wardrobe/" + get(currentUser)?.wardrobeId + "/collections/" + packageId,
    {
      page,
      pageSize,
      filter: {
        phrase,
      },
    }
  )) as PagedResponse;
  return req;
};

export const GetWadrobeSummary = async function () {
  const req = await GetRequest(
    "/api/Wardrobe/" + get(currentUser).wardrobeId + "/summary"
  );
  return req;
};
export const GetWadrobePackagesSingleLayer = async function (
 filter:OutfitFilter,
  page: number = 1,
  pageSize: number = -1
) {
  const req = (await PostRequest(
    "/api/Wardrobe/" + get(currentUser)?.wardrobeId + "/items/singleLayer",
    {
      page,
      pageSize,
      filter
    }
  )) as PagedResponse;
  return req;
};
export const AddCollectionToWardrobe = async function (collectionId: string) {
  const resp = await PostRequest(
    "/api/Wardrobe/" +
      get(currentUser)?.wardrobeId +
      "/" +
      collectionId +
      "/collection",
    {}
  );
  return resp;
};
export const RemoveCollectionFromWardrobe = async function (
  collectionId: string
) {
  const resp = await DeleteRequest(
    "/api/Wardrobe/" +
      get(currentUser)?.wardrobeId +
      "/" +
      collectionId +
      "/collection"
  );
  return resp;
};
