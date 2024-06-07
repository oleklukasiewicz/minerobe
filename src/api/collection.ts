import { DeleteRequest, GetRequest, PostRequest, PutRequest } from "$src/data/api";
import type { OutfitPackageCollection } from "$src/data/common";

export const AddCollection = async function (collectionData: OutfitPackageCollection) {
    const res = await PostRequest("/api/Collections/", collectionData);
    return res;
}
export const GetCollection = async function (collectionId: string) {
    const res = await GetRequest(`/api/Collections/${collectionId}`);
    return res;
}
export const UpdateCollection = async function (collectionData: OutfitPackageCollection) {
    const res = await PutRequest(`/api/Collections/${collectionData.id}`, collectionData);
    return res;
}
export const DeleteCollection = async function (collectionId: string) {
    const res = await DeleteRequest(`/api/Collections/${collectionId}`);
    return res;
}
export const AddPackageToCollection = async function (collectionId: string, packageId: string) {
    const res = await PostRequest(`/api/Collections/add/${collectionId}/${packageId}`,{});
    return res;
}
export const RemovePackageFromCollection = async function (collectionId: string, packageId: string) {
    const res = await DeleteRequest(`/api/Collections/remove/${collectionId}/${packageId}`);
    return res;
}