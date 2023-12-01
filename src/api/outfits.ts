import { currentUser } from "$src/data/cache";
import {
  OutfitPackage,
  type OutfitLayer,
  OutfitPackageLink,
  MinerobeUser,
} from "$src/data/common";
import { MODEL_TYPE, PACKAGE_TYPE } from "$src/data/consts";
import {
  DeleteDocument,
  GenerateIdForCollection,
  GetDocument,
  SetDocument,
} from "$src/data/firebase";
import { get } from "svelte/store";
import {
  AddToWardrobe,
  IsItemInWardrobe,
  UpdateWardrobeItem,
} from "./wardrobe";
import { GetMinerobeUser } from "./auth";

const OUTFIT_PATH = "outfits";

export const GenerateIdForOutfit = function () {
  return GenerateIdForCollection(OUTFIT_PATH);
};
export const CreatedNewOutfit = async function (
  name: string = "New Outfit",
  layers: OutfitLayer[] = [],
  model: string = MODEL_TYPE.ALEX,
  addToWardrobe: boolean = true
): Promise<OutfitPackage> {
  const outfitPackage: OutfitPackage = new OutfitPackage(
    name,
    model,
    layers,
    PACKAGE_TYPE.OUTFIT,
    get(currentUser),
    GenerateIdForOutfit(),
    false
  );

  await SetDocument(OUTFIT_PATH, outfitPackage.id, outfitPackage);
  if (addToWardrobe) {
    await AddToWardrobe(outfitPackage);
  }
  return outfitPackage;
};
export const PrepareOutfit = function (ot: OutfitPackage) {
  let outfitSet = Object.assign({}, ot);
  if (outfitSet.isShared == true)
    return new OutfitPackageLink(
      outfitSet.id,
      outfitSet.model
    ) as OutfitPackage;
  outfitSet.publisher = new MinerobeUser(outfitSet.publisher.id, null, null);
  return outfitSet;
};
export const SaveOutfit = async function (
  outfit: OutfitPackage
): Promise<OutfitPackage> {
  const outfitRef = await GetDocument(OUTFIT_PATH, outfit.id);
  if (outfitRef) {
    await SetDocument(OUTFIT_PATH, outfit.id, outfit);
  }
  return outfit;
};
export const GetOutfit = async function (id: string): Promise<OutfitPackage> {
  let outfit = await GetDocument(OUTFIT_PATH, id);
  if (
    outfit == null ||
    outfit.isShared == false ||
    outfit.publisher.id != get(currentUser).id
  )
    return null;
  outfit.publisher = await GetMinerobeUser(outfit.publisher.id);
  return outfit;
};
export const RemoveOutfit = async function (id: string) {
  const outfit = await GetOutfit(id);
  if (get(currentUser).id == outfit.publisher.id) {
    await DeleteDocument(OUTFIT_PATH, id);
  }
};
export const ShareOutfit = async function (outfit: OutfitPackage) {
  outfit.isShared = true;
  const newId = GenerateIdForOutfit();
  await SetDocument(OUTFIT_PATH, newId, outfit);
  outfit.id = newId;
  if (IsItemInWardrobe(outfit.id, outfit.type)) {
    await UpdateWardrobeItem(outfit);
  }
  return outfit;
};
export const ResolveOutfit = async function (outfit: OutfitPackage) {
  if (outfit.type == PACKAGE_TYPE.OUTFIT_LINK) {
    return await GetOutfit(outfit.id);
  } else outfit.publisher = await GetMinerobeUser(outfit.publisher.id);
  return outfit;
};
