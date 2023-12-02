import { currentUser, wardrobe } from "$src/data/cache";
import type { OutfitPackage, WardrobePackage } from "$src/data/common";
import { PACKAGE_TYPE } from "$src/data/consts";
import {
  GetDocument,
  SetDocument,
  GenerateIdForCollection,
} from "$src/data/firebase";
import { get } from "svelte/store";
import {
  GetOutfitSet,
  PrepareOutfitSet,
  RemoveOutfitSet,
  ResolveOutfitSet,
} from "./sets";
import { PrepareOutfit, ResolveOutfit } from "./outfits";

const WARDROBE_PATH = "wardrobes";
export const GetWardrobe = async function () {
  console.log("getting wardrobe");
  if (get(currentUser)) {
    let dt = await GetDocument(WARDROBE_PATH, get(currentUser).id);
    if (dt == null) return null;
    const data = await ResolveWardrobe(dt);
    return data;
  }
};
export const SetWardrobe = async function (data) {
  if (get(currentUser) && data != null) {
    await SetDocument(
      WARDROBE_PATH,
      get(currentUser).id,
      await PrepareWardrobe(data)
    );
  }
};
export const GenerateIdForWardrobeItem = function () {
  return GenerateIdForCollection(WARDROBE_PATH);
};

const GetDirectoryForType = function (type: string) {
  if (type == PACKAGE_TYPE.OUTFIT_SET) return get(wardrobe).sets;
  else return get(wardrobe).outfits;
};

export const IsItemInWardrobe = function (id: string, type: string) {
  if (get(currentUser)) {
    if (
      GetDirectoryForType(type).find((outfit: OutfitPackage) => outfit.id == id)
    )
      return true;
    return false;
  }
};

export const AddToWardrobe = async function (wardrobeItem: OutfitPackage) {
  if (get(currentUser)) {
    const wardrobePackage: WardrobePackage = get(wardrobe);

    if (IsItemInWardrobe(wardrobeItem.id, wardrobeItem.type)) return;
    if (wardrobeItem.type == PACKAGE_TYPE.OUTFIT_SET)
      wardrobePackage.sets.push(wardrobeItem);
    else wardrobePackage.outfits.push(wardrobeItem);

    wardrobe.set(wardrobePackage);
  }
};
export const RemoveFromWardrobe = async function (wardrobeItemId: string) {
  if (get(currentUser)) {
    const item = await GetOutfitSet(wardrobeItemId);
    if (item != null && item.publisher.id == get(currentUser).id) {
      await RemoveOutfitSet(wardrobeItemId);
    }
    const wardrobePackage: WardrobePackage = get(wardrobe);
    wardrobePackage.outfits = wardrobePackage.outfits.filter(
      (outfit: OutfitPackage) => outfit.id != wardrobeItemId
    );
    wardrobePackage.sets = wardrobePackage.sets.filter(
      (outfit: OutfitPackage) => outfit.id != wardrobeItemId
    );
    wardrobe.set(wardrobePackage);
  }
};
export const UpdateWardrobeItem = async function (wardrobeItem: OutfitPackage) {
  if (get(currentUser)) {
    const wardrobePackage: WardrobePackage = get(wardrobe);
    if (wardrobeItem.type == PACKAGE_TYPE.OUTFIT_SET) {
      const index = wardrobePackage.sets.findIndex(
        (outfit: OutfitPackage) => outfit.id == wardrobeItem.id
      );
      wardrobePackage.sets[index] = wardrobeItem;
    } else {
      const index = wardrobePackage.outfits.findIndex(
        (outfit: OutfitPackage) => outfit.id == wardrobeItem.id
      );
      wardrobePackage.outfits[index] = wardrobeItem;
    }
    wardrobe.set(wardrobePackage);
  }
};
export const UpdateStudioItem = async function (wardrobeItem: OutfitPackage) {
  if (get(currentUser)) {
    const wardrobePackage: WardrobePackage = get(wardrobe);
    wardrobePackage.studio = wardrobeItem;
    wardrobe.set(wardrobePackage);
  }
};
export const PrepareWardrobe = async function (pack: WardrobePackage) {
  let data = Object.assign({}, pack);
  data.sets = data.sets.map((item) => PrepareOutfitSet(item));
  data.outfits = data.outfits.map((item) => PrepareOutfit(item));
  if (data.studio?.id) {
    data.studio = await PrepareItem(data.studio);
  }
  return data;
};
export const ResolveWardrobe = async function (data: WardrobePackage) {
  let mappedSets: OutfitPackage[] = [];
  await Promise.all(
    data.sets.map(async (item) => {
      const mapped = await ResolveOutfitSet(item);
      mappedSets.push(mapped);
      return mapped;
    })
  );
  let mappedOutfits: OutfitPackage[] = [];
  await Promise.all(
    data.outfits.map(async (item) => {
      const mapped = await ResolveOutfit(item);
      mappedOutfits.push(mapped);
      return mapped;
    })
  );
  data.sets = mappedSets as OutfitPackage[];
  data.outfits = mappedOutfits as OutfitPackage[];
  if (data.studio?.id) {
    data.studio = await ResolveItem(data.studio);
  }
  return data;
};
export const ResolveItem = function (item: OutfitPackage) {
  if (item.type == PACKAGE_TYPE.OUTFIT_SET_LINK) return ResolveOutfitSet(item);
  if(item.type == PACKAGE_TYPE.OUTFIT_LINK) return ResolveOutfit(item);
  else return item;
};
export const PrepareItem = function (item: OutfitPackage) {
  if (item.type == PACKAGE_TYPE.OUTFIT_SET_LINK) return PrepareOutfitSet(item);
  if(item.type == PACKAGE_TYPE.OUTFIT_LINK) return PrepareOutfit(item);
  else return item;
};
