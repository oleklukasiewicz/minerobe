import { currentUser } from "$src/data/cache";
import {
  OutfitPackage,
  OutfitLayer,
  OutfitPackageLink,
  PackageSocialData,
  OutfitPackageSnapshotPackage,
} from "$src/data/common";
import {
  DATA_PATH_CONFIG,
  MODEL_TYPE,
  OUTFIT_TYPE,
  PACKAGE_TYPE,
} from "$src/data/consts";
import { get } from "svelte/store";
import { MergePackageLayers } from "$src/helpers/imageDataHelpers";
import { RenderTextureInTemporyNode } from "$src/data/render";
import { OutfitPackageInstance, OutfitPackageInstanceConfig } from "$src/helpers/outfitPackageHelper";

const parseSnapshot = async function (
  data: OutfitLayer[],
  pack: OutfitPackage
) {
  data[0].id = pack.id;
  data[0].variantId = pack.id;
  data[0].steve.content = await RenderTextureInTemporyNode(
    await MergePackageLayers(pack.layers, MODEL_TYPE.STEVE),
    MODEL_TYPE.STEVE,
    OUTFIT_TYPE.OUTFIT_SET
  );
  data[0].alex.content = await RenderTextureInTemporyNode(
    await MergePackageLayers(pack.layers, MODEL_TYPE.ALEX),
    MODEL_TYPE.ALEX,
    OUTFIT_TYPE.OUTFIT_SET
  );

  const config = new OutfitPackageSnapshotPackage();
  config.isMerged = true;
  config.snapshot = [data[0]];
  return config;
};
const parseSnapshotLocal = async function (x: any, y: any) {
  return y;
};

let config = new OutfitPackageInstanceConfig();
config.isMerged = true;
config.layerCountfromLink = -1;
config.sourcePath = DATA_PATH_CONFIG.OUTFIT_SET;
config.generateSnapshot = false;
config.snapshotParser = parseSnapshot;
config.snapshotParserLocal = parseSnapshotLocal;
config.newPackage = function () {
  return new OutfitPackage(
    "New Outfit set",
    MODEL_TYPE.ALEX,
    [],
    PACKAGE_TYPE.OUTFIT_SET,
    get(currentUser),
    undefined,
    false,
    new PackageSocialData()
  );
};
const instance = OutfitPackageInstance(config);

export const GenerateIdForOutfitSet = () => instance.generateId();

export const UploadOutfitSet = async function (
  data: OutfitPackage,
  isNew = false
) {
  return await instance.upload(data, isNew);
};
export const FetchOutfitSet = async function (
  id: string,
  layers: any = -1,
  model?: string,
  fetchSnapshot = false
) {
  return await instance.fetch(id, layers, model, fetchSnapshot);
};
export const CreateOutfitSet = async function (
  addToWardrobe: boolean = false,
  isShared: boolean = false
) {
  console.log("Creating new outfit set");
  return await instance.create(addToWardrobe, isShared);
};
export const DeleteOutfitSet = async function (outfit: OutfitPackage) {
  await instance.delete(outfit.id);
};
export const UploadSetLayer = async function (
  pack: OutfitPackage,
  layer: OutfitLayer
) {
  await instance.uploadLayer(pack, layer);
};
export const RemoveSetLayer = async function (id: string, layerId) {
  await instance.removeLayer(id, layerId);
};
export const FetchOutfitSetFromLink = async function (link: OutfitPackageLink) {
  return await instance.fetchFromLink(link);
};
