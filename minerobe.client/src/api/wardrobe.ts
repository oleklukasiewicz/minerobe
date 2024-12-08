import { DeleteRequest, GetRequest, PostRequest } from "$src/data/api";
import type { PagedResponse } from "$data/models/base";
import type { OutfitPackageCollectionWithPackageContext } from "$data/models/collection";
import type { OutfitFilter } from "$data/models/filter";
import type { OutfitPackage } from "$data/models/package";
import type { WardrobePackage } from "$data/models/wadrobe";

export const AddPackageToWardrobe = async function (packageId: string) {
  const resp = await PostRequest("/api/Wardrobe/" + packageId, {});
  return resp;
};
export const RemovePackageFromWardrobe = async function (packageId: string) {
  const resp = await DeleteRequest("/api/Wardrobe/" + packageId);
  return resp;
};
export const GetUserWardrobe = async function () {
  const req = await GetRequest("/api/Wardrobe/");
  const st = req as WardrobePackage;
  return st;
};
export const GetWardrobePackages = async function (
  filter: OutfitFilter,
  page: number = 0,
  pageSize: number = -1
) {
  const req = (await PostRequest("/api/Wardrobe/items", {
    page,
    pageSize,
    filter,
  })) as PagedResponse<OutfitPackage>;
  return req;
};
export const GetWadrobeCollections = async function (
  phrase: string = "",
  page: number = 0,
  pageSize: number = -1
) {
  const req = (await PostRequest("/api/Wardrobe/collections", {
    page,
    pageSize,
    filter: {
      phrase,
    },
  })) as PagedResponse<OutfitPackage>;
  return req;
};
export const GetWadrobeCollectionsWithPackageContext = async function (
  packageId: string,
  phrase: string = "",
  page: number = 0,
  pageSize: number = -1
) {
  const req = (await PostRequest(
    "/api/Wardrobe/collections/context/" + packageId,
    {
      page,
      pageSize,
      filter: {
        phrase,
      },
    }
  )) as PagedResponse<OutfitPackageCollectionWithPackageContext>;
  return req;
};

export const GetWadrobeSummary = async function () {
  const req = await GetRequest("/api/Wardrobe/summary");
  return req;
};
export const GetWadrobePackagesSingleLayer = async function (
  filter: OutfitFilter,
  page: number = 1,
  pageSize: number = -1
) {
  const req = (await PostRequest("/api/Wardrobe/items/singleLayer", {
    page,
    pageSize,
    filter,
  })) as PagedResponse<OutfitPackage>;
  return req;
};
export const AddCollectionToWardrobe = async function (collectionId: string) {
  const resp = await PostRequest(
    "/api/Wardrobe/" + collectionId + "/collection",
    {}
  );
  return resp;
};
export const RemoveCollectionFromWardrobe = async function (
  collectionId: string
) {
  const resp = await DeleteRequest(
    "/api/Wardrobe/" + collectionId + "/collection"
  );
  return resp;
};
