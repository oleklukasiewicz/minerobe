import { DeleteRequest, GetRequest, PostRequest } from "$src/data/api";
import type { PagedModel, PagedResponse, SortOption } from "$data/models/base";
import type {
  OutfitPackageCollection,
  OutfitPackageCollectionWithPackageContext,
} from "$data/models/collection";
import type { OutfitFilter } from "$data/models/filter";
import type { OutfitPackage } from "$data/models/package";
import type { WardrobePackage } from "$data/models/wadrobe";
import { page } from "$app/state";

export const AddPackageToWardrobe = async function (packageId: string) {
  const resp = await PostRequest("/api/Wardrobe/item/" + packageId, {});
  return resp;
};
export const RemovePackageFromWardrobe = async function (packageId: string) {
  const resp = await DeleteRequest("/api/Wardrobe/item/" + packageId);
  return resp;
};
export const GetUserWardrobe = async function () {
  const req = await GetRequest("/api/Wardrobe/");
  const st = req as WardrobePackage;
  return st;
};
export const GetWardrobePackages = async function (
  pagedModel: PagedModel<OutfitFilter>,
  abortController = null
) {
  const req = (await PostRequest(
    "/api/Wardrobe/items",
    {
      page: pagedModel.page,
      pageSize: pagedModel.pageSize,
      filter: pagedModel.filter,
      sort: pagedModel.sort,
    },
    abortController
  )) as PagedResponse<OutfitPackage>;
  return req;
};
export const GetWadrobeCollections = async function (
  phrase: string = "",
  page: number = 0,
  pageSize: number = -1,
  abortController = null
) {
  const req = (await PostRequest(
    "/api/Wardrobe/collections",
    {
      page,
      pageSize,
      filter: {
        phrase,
      },
    },
    abortController
  )) as PagedResponse<OutfitPackageCollection>;
  return req;
};
export const GetWadrobeCollectionsWithPackageContext = async function (
  packageId: string,
  phrase: string = "",
  page: number = 0,
  pageSize: number = -1,
  abortController = null
) {
  const req = (await PostRequest(
    "/api/Wardrobe/collections/context/" + packageId,
    {
      page,
      pageSize,
      filter: {
        phrase,
      },
    },
    abortController
  )) as PagedResponse<OutfitPackageCollectionWithPackageContext>;
  return req;
};
export const GetWardrobeItemsWithCollectionContext = async function (
  collectionId: string,
  filter: OutfitFilter,
  page: number = 0,
  pageSize: number = -1,
  sort: SortOption[] = [],
  abortController = null
) {
  const req = (await PostRequest(
    "/api/Wardrobe/items/context/collection/" + collectionId,
    {
      page,
      pageSize,
      filter,
      sort,
    },
    abortController
  )) as PagedResponse<OutfitPackage>;
  return req;
};

export const GetWadrobePackagesSingleLayer = async function (
  pagedModel: PagedModel<OutfitFilter>
) {
  const req = (await PostRequest(
    "/api/Wardrobe/items/singleLayer",
    pagedModel
  )) as PagedResponse<OutfitPackage>;
  return req;
};
export const AddCollectionToWardrobe = async function (collectionId: string) {
  const resp = await PostRequest(
    "/api/Wardrobe/collection/" + collectionId,
    {}
  );
  return resp;
};
export const RemoveCollectionFromWardrobe = async function (
  collectionId: string
) {
  const resp = await DeleteRequest("/api/Wardrobe/collection" + collectionId);
  return resp;
};
