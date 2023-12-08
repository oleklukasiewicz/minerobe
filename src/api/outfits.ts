import { currentUser, wardrobe } from "$src/data/cache";
import {
  OutfitPackage,
  type OutfitLayer,
  OutfitPackageLink,
  MinerobeUser,
  OutfitLayerLink,
} from "$src/data/common";
import { LAYER_TYPE, MODEL_TYPE, PACKAGE_TYPE } from "$src/data/consts";
import {
  DeleteDocument,
  GenerateIdForCollection,
  GetDocument,
  SetDocument,
} from "$src/data/firebase";
import { get } from "svelte/store";
import { GetMinerobeUser } from "./auth";
import { AddItemToWardrobe } from "$src/helpers/apiHelper";

const OUTFIT_PATH = "outfits";
const OOUTFIT_LAYER_PATH = "dummy";

export const GenerateIdForOutfit = function () {
  return GenerateIdForCollection(OUTFIT_PATH);
};
export const GenerateIdForOutfitLayer = function () {
  return GenerateIdForCollection(OOUTFIT_LAYER_PATH);
};

const _fetchOutfit = async function (id,bypassSharedFlag=false) {
  let outfit = await GetDocument(OUTFIT_PATH, id);
  if (
    outfit == null ||
    (outfit?.publisher?.id != get(currentUser)?.id && (bypassSharedFlag?false:outfit.isShared == false))
  )
    return null;
  return outfit;
};
export const ParseOutfitToLocal = async function (pack: OutfitPackage) {
  let parsed = Object.assign({}, pack);
  parsed.publisher = await GetMinerobeUser(parsed.publisher.id);
  return parsed;
};
export const ParseOutfitToDatabase = function (outfit: OutfitPackage) {
  let data = Object.assign({}, outfit);
  data.publisher = new MinerobeUser(data.publisher.id, null, null);
  return data;
};
export const FetchOutfitFromLink = async function (link: OutfitPackageLink) {
  let parsed = await _fetchOutfit(link.id);
  if (parsed == null) return null;
  parsed.model = link.model;
  parsed.publisher = await GetMinerobeUser(parsed.publisher.id);
  return parsed;
};
export const FetchOutfit = async function (id: string) {
  let parsed = await _fetchOutfit(id);
  return await ParseOutfitToLocal(parsed);
};
export const FetchOutfitLayerFromLink = async function (link: OutfitLayerLink,bypassSharredFlag:boolean = false) {
  let parsed = await _fetchOutfit(link.id,bypassSharredFlag);
  if (parsed == null) return null;
  let layer = parsed.layers.find((layer) => layer.variantId == link.variantId);
  layer.id = parsed.id;
  layer.type = LAYER_TYPE.REMOTE;
  layer.name = parsed.name + " - " + layer.name;
  return layer;
};
export const UploadOutfit = async function (outfit: OutfitPackage) {
  if(outfit.publisher.id != get(currentUser)?.id) return;
  if(outfit.layers.length == 0) return;
  await SetDocument(
    OUTFIT_PATH,
    outfit.id,
    await ParseOutfitToDatabase(outfit)
  );
};
export const CreateOutfit = async function (
  addToWardrobe: boolean = false,
  isShared: boolean = false
) {
  let outfit = new OutfitPackage(
    "New outfit",
    MODEL_TYPE.ALEX,
    [],
    PACKAGE_TYPE.OUTFIT,
    get(currentUser),
    GenerateIdForOutfit(),
    isShared
  );
  await UploadOutfit(outfit);
  if (addToWardrobe) {
    await AddItemToWardrobe(outfit);
  }
  return outfit;
};
