import {
  DeleteRequest,
  GetRequest,
  PostRequest,
  PutRequest,
} from "$src/data/api";
import type { OutfitLayer, OutfitPackage } from "$data/models/package";
//packages
export const GetPackage = async function (id: string) {
  const res = await GetRequest("/api/Package/" + id);
  return res;
};
export const UpdatePackage = async function (packageData: OutfitPackage) {
  const data = Object.assign({}, packageData);
  delete data.layers;
  const res = await PutRequest("/api/Package/" + packageData.id, data);
  return res;
};
//layers
export const AddPackageLayer = async function (layer: OutfitLayer) {
  const res = await PostRequest("/api/Layers/", layer);
  return res;
};
export const SetMergedLayer = async function (layer: OutfitLayer) {
  const res = await PostRequest("/api/Layers/Merged", layer);
  return res;
};
export const RemovePackageLayer = async function (layerId: string) {
  const res = await DeleteRequest("/api/Layers/" + layerId);
  return res;
};
export const RemovePackageLayerWithPackageContext = async function (
  layer: OutfitLayer,
  packageId: string
) {
  if (layer.sourcePackageId === packageId) await RemovePackageLayer(layer.id);
  else await RemoveRemoteLayerFromPackage(layer.id, packageId);
};
export const UpdatePackageLayer = async function (layer: OutfitLayer) {
  const res = await PutRequest("/api/Layers/" + layer.id, layer);
  return res;
};
export const SetPackageLayerOrder = async function (
  packageId: string,
  layersIds: string[]
) {
  const res = await PostRequest("/api/Layers/Order/" + packageId, layersIds);
  return res;
};
export const AddPackage = async function (packageData: OutfitPackage) {
  const data = Object.assign({}, packageData) as any;
  const res = await PostRequest("/api/Package/", data);
  return res;
};
export const RemovePackage = async function (packageId: string) {
  const res = await DeleteRequest("/api/Package/" + packageId);
  return res;
};
export const AddRemoteLayerToPackage = async function (
  layerId: string,
  packageId: string
) {
  const res = await PostRequest(
    "/api/Layers/add/" + layerId + "/" + packageId,
    {}
  );
  return res;
};
export const GetLayer = async function (id: string) {
  const res = await GetRequest("/api/Layers/" + id);
  return res;
};
export const GetLayerSnapshot = async function (id: string) {
  const res = await GetRequest("/api/Layers/" + id + "/snapshot");
  return res;
};
export const RemoveRemoteLayerFromPackage = async function (
  layerId: string,
  packageId: string
) {
  const res = await DeleteRequest(
    "/api/Layers/remove/" + layerId + "/" + packageId
  );
  return res;
};
