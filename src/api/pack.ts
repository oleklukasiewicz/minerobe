import {
  DeleteRequest,
  GetRequest,
  PostRequest,
  PutRequest,
} from "$src/data/api";
import type { OutfitLayer, OutfitPackage } from "$src/data/common";
//packages
export const GetPackage = async function (id: string) {
  const res = await GetRequest("/api/Package/" + id);
  return res;
};
export const UpdatePackage = async function (packageData: OutfitPackage) {
  const res = await PutRequest("/api/Package/" + packageData.id, packageData);
  return res;
};
export const UpdatePackageData = async function (packageData: OutfitPackage) {
  const data = Object.assign({}, packageData);
  delete data.layers;
  const res = await PutRequest(
    "/api/Package/" + packageData.id + "/data",
    data
  );
  return res;
};
//layers
export const AddPackageLayer = async function (layer: OutfitLayer) {
  const res = await PostRequest("/api/Layers/", layer);
  return res;
};
export const SetGlobalLayer = async function (layer: OutfitLayer) {
  const res = await PostRequest("/api/Layers/Global", layer);
  return res;
}
export const RemovePackageLayer = async function (layerId: string) {
  const res = await DeleteRequest("/api/Layers/" + layerId);
  return res;
};
export const UpdatePackageLayer = async function (layer: OutfitLayer) {
  const res = await PutRequest("/api/Layers/" + layer.id, layer);
  return res;
};
export const OrderPackageLayer = async function (
  packageId: string,
  layersIds: string[]
) {
  const res = await PostRequest("/api/Layers/Order/" + packageId, layersIds);
  return res;
};
