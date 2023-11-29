import { currentUser, wardrobe, wardrobeNormalized } from "$src/data/cache";
import type {
  OutfitPackageLink,
  OutfitPackage,
  WardrobePackage,
} from "$src/data/common";
import { OUTFIT_TYPE, PACKAGE_TYPE } from "$src/data/consts";
import {
  GetDocument,
  SetDocument,
  GenerateIdForCollection,
} from "$src/data/firebase";
import { get } from "svelte/store";
import { GetOutfitSet, RemoveOutfitSet } from "./sets";
import { GetMinerobeUser } from "./auth";

const WARDROBE_PATH = "wardrobes";
export const GetWardrobe = async function () {
  if (get(currentUser)) {
    let wardrobe = await GetDocument(WARDROBE_PATH, get(currentUser).id);
    if (wardrobe != null && wardrobe.sets != null) {
      let mappedSets = [];
      await Promise.all(
        wardrobe.sets.map(async (item) => {
          const mapped = await ResolveWardrobeSetItem(item);
          mappedSets.push(mapped);
        })
      );
      wardrobe.sets = mappedSets;
      if (wardrobe.studio != null) {
        wardrobe.studio.publisher = await GetMinerobeUser(
          wardrobe.studio.publisher.id
        );
      }
      return wardrobe;
    }
  }
};
const ResolveWardrobeSetItem = async function (item: any) {
  if (item.type != PACKAGE_TYPE.OUTFIT_SET_LINK) {
    item.publisher = await GetMinerobeUser(item.publisher.id);
    return item;
  }
  const outfitSet = await GetOutfitSet(item.id);
  return outfitSet;
};
export const SetWardrobe = async function (data) {
  if (get(currentUser) && data != null) {
    //convert wardrobe package to objec
    return await SetDocument(WARDROBE_PATH, get(currentUser).id, data);
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
