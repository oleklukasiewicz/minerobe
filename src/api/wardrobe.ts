import { currentUser, wardrobe } from "$src/data/cache";
import type { OutfitPackage, WardrobePackage } from "$src/data/common";
import { PACKAGE_TYPE } from "$src/data/consts";
import { GetDocument, SetDocument ,GenerateIdForCollection} from "$src/data/firebase";
import { get } from "svelte/store";
import { GetOutfitSet, RemoveOutfitSet } from "./sets";

const WARDROBE_PATH = "wardrobes";
export const GetWardrobe = async function () {
  if (get(currentUser))
    return await GetDocument(WARDROBE_PATH, get(currentUser).id);
};
export const SetWardrobe = async function (data) {
  if (get(currentUser) && data != null) {
    //convert wardrobe package to object
    const json = JSON.stringify(data);
    return await SetDocument(
      WARDROBE_PATH,
      get(currentUser).id,
      JSON.parse(json)
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