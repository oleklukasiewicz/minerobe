import {
  OutfitPackageLink,
  OutfitPackageCollection,
  PackageSocialData,
} from "$src/data/common";
import { PACKAGE_TYPE } from "$src/data/consts";
import {
  DeleteCollection,
  GenerateIdForCollection,
  GetDocument,
  SetDocument,
} from "$src/data/firebase";
import { FetchOutfitSetSnapshotFromLink } from "./sets";
import { FetchOutfitSnapshotFromLink } from "./outfits";
import { get } from "svelte/store";
import { currentUser } from "$src/data/cache";

const COLLECTION_PATH = "collections";

export const GenerateIdForOutfitCollection = () =>
  GenerateIdForCollection(COLLECTION_PATH);
const ParseOutfitCollectionToLocal = async function (
  pack: OutfitPackageCollection
) {
  let parsed = Object.assign({}, pack);
  for (let i = 0; i < parsed.outfits.length; i++) {
    let outfit = parsed.outfits[i];
    if (outfit.type == PACKAGE_TYPE.OUTFIT_SET_LINK)
      return await FetchOutfitSetSnapshotFromLink(outfit as any);
    else return await FetchOutfitSnapshotFromLink(outfit as any);
  }
  return parsed;
};
const ParseOutfitCollectionToDatabase = async function (
  pack: OutfitPackageCollection
) {
  let parsed = Object.assign({}, pack);
  parsed.outfits.map((outfit) => {
    new OutfitPackageLink(
      outfit.id,
      outfit.model,
      outfit.type,
      outfit.variantId
    );
  });
  return parsed;
};
export const FetchOutfitCollection = async function (id: string) {
  const item = await GetDocument(COLLECTION_PATH + "/" + id, "data");
  return ParseOutfitCollectionToLocal(item);
};
export const UploadOutfitCollection = async function (
  pack: OutfitPackageCollection,
  isNew = true
) {
  const parsed = await ParseOutfitCollectionToDatabase(pack);
  await SetDocument(COLLECTION_PATH + "/" + pack.id, "data", parsed);
};
export const DeleteOutfitCollection = async function (id: string) {
  await DeleteCollection(COLLECTION_PATH + "/" + id);
};
export const CreateOutfitCollection = async function (
  addToWardrobe = true,
  isShared = false
) {
  let collection = new OutfitPackageCollection(
    GenerateIdForOutfitCollection(),
    "new Collection",
    [],
    null,
    get(currentUser),
    isShared,
    new PackageSocialData(),
    null,
    new Date(),
    new Date()
  );
  return collection;
};
