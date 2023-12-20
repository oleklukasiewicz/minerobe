import { currentUser } from "$src/data/cache";
import {
  OutfitPackage,
  OutfitPackageLink,
  MinerobeUser,
  OutfitLayerLink,
  PackageSocialData,
} from "$src/data/common";
import { LAYER_TYPE, MODEL_TYPE, PACKAGE_TYPE } from "$src/data/consts";
import {
  DeleteCollection,
  DeleteDocument,
  GenerateIdForCollection,
  GetDocument,
  UpdateDocument,
} from "$src/data/firebase";
import { get } from "svelte/store";
import { GetMinerobeUser } from "./auth";
import { AddItemToWardrobe } from "$src/helpers/apiHelper";

const OUTFIT_PATH = "outfits";
const OUTFIT_LOCAL_PATH = "data";
const OUTFIT_DATA_PATH = "itemdata";
const OUTFIT_SOCIAL_PATH = "social";
const OUTFIT_SNAPSHOT_PATH = "snapshot";
const OUTFIT_LAYER_PATH = "dummy";

export const GenerateIdForOutfit = () => GenerateIdForCollection(OUTFIT_PATH);
export const GenerateIdForOutfitLayer = () =>
  GenerateIdForCollection(OUTFIT_LAYER_PATH);

const _fetchOutfit = async function (id, bypassSharedFlag = false) {
  let outfit = (await GetDocument(
    OUTFIT_PATH + "/" + id + "/" + OUTFIT_LOCAL_PATH,
    OUTFIT_DATA_PATH
  )) as OutfitPackage;
  if (
    outfit == null ||
    (outfit?.publisher?.id != get(currentUser)?.id &&
      (bypassSharedFlag ? false : outfit.isShared == false))
  )
    return null;

  let social = (await GetDocument(
    OUTFIT_PATH + "/" + id + "/" + OUTFIT_LOCAL_PATH,
    OUTFIT_SOCIAL_PATH
  )) as PackageSocialData;
  outfit.social = social;
  if (outfit.social == null) {
    outfit.social = new PackageSocialData();
    await UpdateDocument(
      OUTFIT_PATH + "/" + id + "/" + OUTFIT_LOCAL_PATH,
      OUTFIT_SOCIAL_PATH,
      outfit.social
    );
  }
  return outfit;
};
export const ParseOutfitToLocal = async function (pack: OutfitPackage) {
  let parsed = Object.assign({}, pack);
  parsed.publisher = await GetMinerobeUser(parsed.publisher.id);
  return parsed;
};
export const ParseOutfitToDatabase = function (
  outfit: OutfitPackage,
  isNew: boolean = false
) {
  let data = Object.assign({}, outfit);
  if (!isNew) delete data.social;
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
export const FetchOutfitLayerFromLink = async function (
  link: OutfitLayerLink,
  bypassSharredFlag: boolean = false
) {
  let parsed = await _fetchOutfit(link.id, bypassSharredFlag);
  if (parsed == null) return null;
  let layer = parsed.layers.find((layer) => layer.variantId == link.variantId);
  if (layer == null) return null;
  layer.id = parsed.id;
  layer.type = LAYER_TYPE.REMOTE;
  layer.name = parsed.name + " - " + layer.name;
  return layer;
};
export const UploadOutfit = async function (
  outfit: OutfitPackage,
  isNew: boolean = false
) {
  if (outfit.publisher.id != get(currentUser)?.id || outfit.id == null) return;
  let parsed = ParseOutfitToDatabase(outfit, isNew);
  delete parsed.social;

  await UpdateDocument(
    OUTFIT_PATH + "/" + outfit.id + "/" + OUTFIT_LOCAL_PATH,
    OUTFIT_DATA_PATH,
    parsed
  );
  return outfit;
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
    isShared,
    new PackageSocialData()
  );
  await UploadOutfit(outfit, true);
  if (addToWardrobe) {
    await AddItemToWardrobe(outfit);
  }
  return outfit;
};
export const DeleteOutfit = async function (outfit: OutfitPackage) {
  if (outfit.publisher.id != get(currentUser)?.id) return;
  await DeleteCollection(
    OUTFIT_PATH + "/" + outfit.id + "/" + OUTFIT_LOCAL_PATH
  );
};
