import {
  DeleteRequest,
  GetRequest,
  PostRequest,
  PutRequest,
} from "$src/data/api";
import type { OutfitPackageCollection } from "$data/models/collection";
import type { OutfitFilter } from "$src/data/models/filter";
import type { PagedResponse, SortOption } from "$src/data/models/base";
import type { OutfitPackage } from "$src/data/models/package";

export const AddCollection = async function (
  collectionData: OutfitPackageCollection
) {
  const res = await PostRequest("/api/Collections/", collectionData);
  return res;
};
export const GetCollection = async function (
  collectionId: string
): Promise<OutfitPackageCollection> {
  const res = await GetRequest(`/api/Collections/${collectionId}`);
  return res;
};
export const GetCollectionsItems = async function (
  collectionId: string,
  filter: OutfitFilter,
  page: number = 0,
  pageSize: number = -1,
  sort: SortOption[] = [],
  abortController = null
):Promise<PagedResponse<OutfitPackage>> {
  const res = await PostRequest(
    `/api/Collections/${collectionId}/items`,
    {
      page,
      pageSize,
      filter,
      sort,
    },
    abortController
  );
  return res;
};
export const UpdateCollection = async function (
  collectionData: OutfitPackageCollection
) {
  const res = await PutRequest(
    `/api/Collections/${collectionData.id}`,
    collectionData
  );
  return res;
};
export const DeleteCollection = async function (collectionId: string) {
  const res = await DeleteRequest(`/api/Collections/${collectionId}`);
  return res;
};
export const AddPackageToCollection = async function (
  collectionId: string,
  packageId: string
) {
  const res = await PostRequest(
    `/api/Collections/${collectionId}/add/${packageId}`,
    {}
  );
  return res;
};
export const RemovePackageFromCollection = async function (
  collectionId: string,
  packageId: string
) {
  const res = await DeleteRequest(
    `/api/Collections/${collectionId}/remove/${packageId}`
  );
  return res;
};
