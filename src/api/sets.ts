import { currentUser } from "$src/data/cache";
import {
  OutfitPackage,
  OutfitLayer,
  OutfitPackageLink,
  PackageSocialData,
  OutfitPackageSnapshotConfig,
  OutfitPackageSnapshotPackage,
} from "$src/data/common";
import {
  DATA_PATH_CONFIG,
  LAYER_TYPE,
  MODEL_TYPE,
  PACKAGE_TYPE,
} from "$src/data/consts";
import { GenerateIdForCollection } from "$src/data/firebase";
import { get } from "svelte/store";
import {
  DeletePackage,
  DeletePackageLayer,
  FetchPackage,
  UploadPackage,
  UploadPackageLayer,
} from "./pack";
import { AddItemToWardrobe } from "$src/helpers/apiHelper";
import { MergePackageLayers } from "$src/helpers/imageDataHelpers";

const SETS_PATH = DATA_PATH_CONFIG.OUTFIT_SET;

export const GenerateIdForOutfitSet = () => GenerateIdForCollection(SETS_PATH);

export const parseSnapshot = async function (
  data: OutfitLayer[],
  pack: OutfitPackage
) {
  data[0].id = pack.id;
  data[0].variantId = pack.id;
  data[0].steve.content = await MergePackageLayers(pack.layers, MODEL_TYPE.STEVE);
  data[0].alex.content = await MergePackageLayers(pack.layers, MODEL_TYPE.ALEX);
  const config= new OutfitPackageSnapshotPackage();
  config.isMerged=true;
  config.snapshot=[data[0]];
  return config;
};

export const UploadOutfitSet = async function (
  data: OutfitPackage,
  isNew = false
) {
  data.snapshotConfig = new OutfitPackageSnapshotConfig();
  data.snapshotConfig.isMerged = true;
  return await UploadPackage(data, SETS_PATH, undefined, isNew,true,parseSnapshot);
};
export const FetchOutfitSet = async function (
  id: string,
  layers: any = -1,
  model?: string,
  fetchSnapshot=false
) {
  let parsed = await FetchPackage(SETS_PATH, id, undefined, layers,fetchSnapshot);
  if (parsed == null) return null;
  parsed.model = model || parsed.model;
  return parsed;
};
export const CreateOutfitSet = async function (
  addToWardrobe: boolean = false,
  isShared: boolean = false
) {
  console.log("Creating new outfit set");
  let data = new OutfitPackage(
    "New Outfit set",
    MODEL_TYPE.ALEX,
    [],
    PACKAGE_TYPE.OUTFIT_SET,
    get(currentUser),
    GenerateIdForOutfitSet(),
    isShared,
    new PackageSocialData()
  );
  const res = await UploadOutfitSet(data, true);
  if (addToWardrobe) {
    await AddItemToWardrobe(res);
  }
  return data;
};
export const DeleteOutfitSet = async function (outfit: OutfitPackage) {
  await DeletePackage(SETS_PATH, outfit.id);
};
export const UploadSetLayer = async function (
  pack: OutfitPackage,
  layer: OutfitLayer
) {
  if (layer.type == LAYER_TYPE.LOCAL) {
    await UploadPackageLayer(pack, layer, SETS_PATH, undefined);
  }
};
export const RemoveSetLayer = async function (id: string, layerId) {
  await DeletePackageLayer(id, layerId, SETS_PATH);
};
export const FetchOutfitSetFromLink = async function (link: OutfitPackageLink) {
  return await FetchOutfitSet(link.id, [link.id], link.model, true);
};
