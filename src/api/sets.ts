import { currentUser } from "$src/data/cache";
import {
  OutfitPackage,
  OutfitLayer,
  OutfitPackageLink,
  PackageSocialData,
} from "$src/data/common";
import { DATA_PATH_CONFIG, LAYER_TYPE, MODEL_TYPE, PACKAGE_TYPE } from "$src/data/consts";
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

const SETS_PATH =DATA_PATH_CONFIG.OUTFIT_SET;

export const GenerateIdForOutfitSet = () => GenerateIdForCollection(SETS_PATH);

export const UploadOutfitSet = async function (
  data: OutfitPackage,
  isNew = false
) {
  return await UploadPackage(data, SETS_PATH, undefined, isNew);
};
export const FetchOutfitSet = async function (
  id: string,
  layers: any = -1,
  model?: string
) {
  let parsed = await FetchPackage(SETS_PATH, id, undefined, layers);
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
export const UploadSetLayer = async function (id: string, layer: OutfitLayer) {
  if (layer.type == LAYER_TYPE.LOCAL) {
    await UploadPackageLayer(id, layer, SETS_PATH);
  }
};
export const RemoveSetLayer = async function (id: string, layerId) {
  await DeletePackageLayer(id, layerId, SETS_PATH);
};
export const FetchOutfitSetFromLink = async function (link: OutfitPackageLink) {
  return await FetchOutfitSet(link.id, 2, link.model);
};
