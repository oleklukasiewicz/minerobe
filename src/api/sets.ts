import { currentUser, wardrobe } from "$src/data/cache";
import { OutfitPackage, type OutfitLayer } from "$src/data/common";
import { MODEL_TYPE, OUTFIT_TYPE, PACKAGE_TYPE } from "$src/data/consts";
import {
  DeleteDocument,
  GenerateIdForCollection,
  GetDocument,
  SetDocument,
} from "$src/data/firebase";
import { GetMinerobeUser } from "./auth";
import {
  AddToWardrobe,
  IsItemInWardrobe,
  UpdateWardrobeItem,
} from "./wardrobe";
import { get } from "svelte/store";

const SETS_PATH = "sets";
export const GenerateIdForOutfitSet = function () {
  return GenerateIdForCollection(SETS_PATH);
};

export const CreatedNewOutfitSet = async function (
  name: string = "New Skin",
  layers: OutfitLayer[] = [],
  model: string = MODEL_TYPE.ALEX,
  addToWardrobe: boolean = true
): Promise<OutfitPackage> {
  const outfitPackage: OutfitPackage = new OutfitPackage(
    name,
    model,
    layers,
    PACKAGE_TYPE.OUTFIT_SET,
    get(currentUser),
    GenerateIdForOutfitSet(),
    false
  );

  await SetDocument(SETS_PATH, outfitPackage.id, outfitPackage);
  if (addToWardrobe) {
    await AddToWardrobe(outfitPackage);
  }
  return outfitPackage;
};
export const SaveOutfitSet = async function (
  outfitSet: OutfitPackage
): Promise<OutfitPackage> {
  const outfitSetRef = await GetDocument(SETS_PATH, outfitSet.id);
  if (outfitSetRef) {
    await SetDocument(SETS_PATH, outfitSet.id, outfitSet);
  }
  return outfitSet;
};
export const GetOutfitSet = async function (
  id: string
): Promise<OutfitPackage> {
  let outfitSet = (await GetDocument(SETS_PATH, id)) as OutfitPackage;
  if (
    outfitSet.publisher.id != get(currentUser).id &&
    outfitSet.isShared == false
  )
    return null;
  outfitSet.publisher = await GetMinerobeUser(outfitSet.publisher.id);
  return outfitSet;
};

export const RemoveOutfitSet = async function (id: string) {
  const outfitSet = await GetOutfitSet(id);
  if (get(currentUser).id == outfitSet.publisher.id) {
    await DeleteDocument(SETS_PATH, id);
  }
};
export const ShareOutfitSet = async function (outfitSet: OutfitPackage) {
  outfitSet.isShared = true;
  const newId = GenerateIdForOutfitSet();
  await SetDocument(SETS_PATH, newId, outfitSet);
  outfitSet.id = newId;
  if (IsItemInWardrobe(outfitSet.id, outfitSet.type)) {
    await UpdateWardrobeItem(outfitSet);
  }
  return outfitSet;
};
