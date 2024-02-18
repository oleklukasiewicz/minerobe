import { currentUser } from "$src/data/cache";
import {
  OutfitPackage,
  OutfitPackageLink,
  PackageSocialData,
  OutfitLayer,
} from "$src/data/common";
import {
  DATA_PATH_CONFIG,
  LAYER_TYPE,
  MODEL_TYPE,
  OUTFIT_TYPE,
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

const OUTFIT_PATH = DATA_PATH_CONFIG.OUTFIT;
const OUTFIT_LAYER_PATH = "dummy";

export const GenerateIdForOutfit = () => GenerateIdForCollection(OUTFIT_PATH);
export const GenerateIdForOutfitLayer = () =>
  GenerateIdForCollection(OUTFIT_LAYER_PATH);

const parseToLocal = async function (data: OutfitPackage) {
  data.outfitType =
    data.layers.length > 0 ? data.layers[0].steve.type : OUTFIT_TYPE.DEFAULT;
  return data;
};

export const FetchOutfit = async function (
  id: string,
  layers: any = -1,
  model?: string
) {
  let parsed = await FetchPackage(OUTFIT_PATH, id, parseToLocal, layers);
  if (parsed == null) return null;
  parsed.model = model || parsed.model;
  return parsed;
};
export const UploadOutfit = async function (
  outfit: OutfitPackage,
  isNew: boolean = false
) {
  return await UploadPackage(outfit, OUTFIT_PATH, undefined, isNew);
};
export const CreateOutfit = async function (
  addToWardrobe: boolean = false,
  isShared: boolean = false
) {
  console.log("Creating new outfit");
  let outfit = new OutfitPackage(
    "New outfit",
    MODEL_TYPE.ALEX,
    [],
    PACKAGE_TYPE.OUTFIT,
    get(currentUser),
    GenerateIdForOutfit(),
    isShared,
    new PackageSocialData()
  );
  const res = await UploadOutfit(outfit, true);
  if (addToWardrobe) {
    await AddItemToWardrobe(res);
  }
  return outfit;
};
export const DeleteOutfit = async function (outfit: OutfitPackage) {
  await DeletePackage(OUTFIT_PATH, outfit.id);
};
export const UploadLayer = async function (id: string, layer: OutfitLayer) {
  if (layer.type == LAYER_TYPE.LOCAL) {
    await UploadPackageLayer(id, layer, OUTFIT_PATH);
  }
};
export const RemoveLayer = async function (id: string, layerId: string) {
  await DeletePackageLayer(id, layerId, OUTFIT_PATH);
};
export const FetchOutfitByFilter = async function (
  ids: string[],
  clauses: any[]
) {
  let outfits = await Promise.all(ids.map(async (id) => await FetchOutfit(id)));
  return outfits;
};
export const FetchOutfitFromLink = async function (link: OutfitPackageLink) {
  return await FetchOutfit(link.id, link.variantId || 2, link.model);
};
