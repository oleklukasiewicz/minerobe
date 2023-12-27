import { currentUser } from "$src/data/cache";
import {
  OutfitPackage,
  OutfitPackageLink,
  MinerobeUser,
  OutfitLayerLink,
  PackageSocialData,
} from "$src/data/common";
import {
  LAYER_TYPE,
  MODEL_TYPE,
  OUTFIT_TYPE,
  PACKAGE_TYPE,
} from "$src/data/consts";
import {
  FetchDocsFromQuery,
  GenerateIdForCollection,
  QueryWhere,
} from "$src/data/firebase";
import { get } from "svelte/store";
import { GetMinerobeUser } from "./auth";
import {
  CreatePackage,
  DeletePackage,
  FetchPackage,
  FetchPackageSnapshot,
  FetchPackagesByFilter,
  FetchRawPackage,
  UploadPackage,
  UploadPackageSnapshot,
} from "./pack";
import { GetDominantColorFromImage } from "$src/helpers/colorHelper";
import type { DocumentData, Query } from "firebase/firestore";

const OUTFIT_PATH = "outfits";
const OUTFIT_LOCAL_PATH = "data";
const OUTFIT_LAYER_PATH = "dummy";

export const GenerateIdForOutfit = () => GenerateIdForCollection(OUTFIT_PATH);
export const GenerateIdForOutfitLayer = () =>
  GenerateIdForCollection(OUTFIT_LAYER_PATH);

export const ParseOutfitToLocal = async function (pack: OutfitPackage) {
  let parsed = Object.assign({}, pack);
  if (parsed.publisher.id == get(currentUser)?.id)
    parsed.publisher = get(currentUser);
  else parsed.publisher = await GetMinerobeUser(parsed.publisher.id);
  return parsed;
};
export const ParseOutfitSnapshotToDatabase = async function (
  pack: OutfitPackage
) {
  let parsed = Object.assign({}, pack);
  parsed.description = null;
  let length = parsed.layers.length;
  const toSnaphot = parsed.layers.slice(0, 2);
  parsed.layers = new Array(length);
  toSnaphot.forEach((layer, index) => (parsed.layers[index] = layer));
  for (let i = 0; i < toSnaphot.length; i++) {
    if (parsed.layers[i].steve.color == null)
      parsed.layers[i].steve.color = await GetDominantColorFromImage(
        parsed.layers[i].steve.content
      );
    if (parsed.layers[i].alex.color == null)
      parsed.layers[i].alex.color = await GetDominantColorFromImage(
        parsed.layers[i].alex.content
      );
  }
  parsed.outfitType =
    parsed.layers.length > 0 ? parsed.layers[0]?.steve.type : OUTFIT_TYPE.DEFAULT;
  parsed.publisher = new MinerobeUser(parsed.publisher.id, null, null);
  return parsed;
};
export const ParseOutfitToDatabase = async function (
  outfit: OutfitPackage,
  isNew: boolean = false
) {
  let data = Object.assign({}, outfit);
  for (let i = 0; i < data.layers.length; i++) {
    if (data.layers[i].steve.color == null)
      data.layers[i].steve.color = await GetDominantColorFromImage(
        data.layers[i].steve.content
      );
    if (data.layers[i].alex.color == null)
      data.layers[i].alex.color = await GetDominantColorFromImage(
        data.layers[i].alex.content
      );
  }

  data.outfitType =
    data.layers.length > 0 ? data.layers[0]?.steve.type : OUTFIT_TYPE.DEFAULT;
  if (!isNew) delete data.social;
  data.publisher = new MinerobeUser(data.publisher.id, null, null);
  return data;
};
export const FetchOutfitFromLink = async function (link: OutfitPackageLink) {
  let parsed = await FetchPackage(
    OUTFIT_PATH + "/" + link.id + "/" + OUTFIT_LOCAL_PATH,
    ParseOutfitToLocal
  );
  if (parsed == null) return null;
  parsed.model = link.model;
  parsed.publisher = await GetMinerobeUser(parsed.publisher.id);
  return parsed;
};
export const FetchOutfit = async function (id: string) {
  let data = await FetchPackage(
    OUTFIT_PATH + "/" + id + "/" + OUTFIT_LOCAL_PATH,
    ParseOutfitToLocal
  );
  return data;
};
export const FetchOutfitLayerFromLink = async function (link: OutfitLayerLink) {
  let parsed = await FetchOutfit(link.id);
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
  await UploadPackage(
    OUTFIT_PATH + "/" + outfit.id + "/" + OUTFIT_LOCAL_PATH,
    outfit,
    isNew,
    ParseOutfitToDatabase,
    ParseOutfitSnapshotToDatabase
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
    isShared,
    new PackageSocialData()
  );
  return await CreatePackage(
    outfit,
    OUTFIT_PATH + "/" + outfit.id + "/" + OUTFIT_LOCAL_PATH,
    ParseOutfitToDatabase,
    ParseOutfitSnapshotToDatabase,
    addToWardrobe
  );
};
export const DeleteOutfit = async function (outfit: OutfitPackage) {
  await DeletePackage(
    outfit,
    OUTFIT_PATH + "/" + outfit.id + "/" + OUTFIT_LOCAL_PATH
  );
};
export const FetchOutfitSnapshot = async function (id: string) {
  return await FetchPackageSnapshot(
    OUTFIT_PATH + "/" + id + "/" + OUTFIT_LOCAL_PATH,
    ParseOutfitToLocal
  );
};
export const FetchOutfitSnapshotFromLink = async function (
  link: OutfitPackageLink
) {
  let data = await FetchOutfitSnapshot(link.id);
  if (data == null) return null;
  data.model = link.model;
  return data;
};

export const UploadOutfitSnapshot = async function (pack) {
  return await UploadPackageSnapshot(
    OUTFIT_PATH + "/" + pack.id + "/" + OUTFIT_LOCAL_PATH,
    pack,
    ParseOutfitSnapshotToDatabase
  );
};
export const FetchRawOutfit = async function (id: string) {
  let data = await FetchRawPackage(
    OUTFIT_PATH + "/" + id + "/" + OUTFIT_LOCAL_PATH,
    ParseOutfitToLocal
  );
  return data;
};
export const FetchOutfitByFilter = async function (
  outfitsIds: string[],
  filters: QueryWhere[]
) {
  return await FetchPackagesByFilter(
    outfitsIds,
    OUTFIT_PATH,
    OUTFIT_LOCAL_PATH,
    filters,
    ParseOutfitToLocal
  );
};
