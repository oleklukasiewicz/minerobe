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
  addToWardrobe: boolean = true,
  isShared: boolean = false
): Promise<OutfitPackage> {
  const outfitPackage: OutfitPackage = new OutfitPackage(
    name,
    model,
    layers,
    PACKAGE_TYPE.OUTFIT,
    get(currentUser),
    GenerateIdForOutfit(),
    isShared
  );
  if (isShared) {
    await SetDocument(
      OUTFIT_PATH,
      outfitPackage.id,
      await PrepareOutfit(outfitPackage, false)
    );
  }
  if (addToWardrobe) {
    await AddToWardrobe(outfitPackage);
  }
  return outfitPackage;
};
export const PrepareOutfit = function (
  ot: OutfitPackage,
  toLink: boolean = true
) {
  let outfitSet = Object.assign({}, ot);
  if (outfitSet.isShared == true && toLink == true)
    return new OutfitPackageLink(
      outfitSet.id,
      outfitSet.model,
      PACKAGE_TYPE.OUTFIT_LINK
    ) as OutfitPackage;
  outfitSet.publisher = new MinerobeUser(outfitSet.publisher.id, null, null);
  return outfitSet;
};
export const SaveOutfit = async function (
  outfit: OutfitPackage
): Promise<OutfitPackage> {
  if (outfit.layers.length == 0) return null;
  const outfitRef = await GetDocument(OUTFIT_PATH, outfit.id);
  if (outfitRef && outfitRef.publisher.id == get(currentUser).id) {
    await SetDocument(
      OUTFIT_PATH,
      outfit.id,
      await PrepareOutfit(outfit, false)
    );
  }
  return outfit;
};
export const GetOutfit = async function (id: string): Promise<OutfitPackage> {
  let outfit = await GetDocument(OUTFIT_PATH, id);
  if (
    outfit == null ||
    (outfit?.publisher?.id != get(currentUser)?.id && outfit.isShared == false)
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
  if (outfit.layers.length == 0) return;
  outfit.isShared = true;
  const newId = GenerateIdForOutfit();
  outfit.id = newId;
  await SetDocument(OUTFIT_PATH, newId, await PrepareOutfit(outfit, false));
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
