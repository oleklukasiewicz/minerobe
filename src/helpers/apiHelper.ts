import { UploadOutfit } from "$src/api/outfits";
import { UploadOutfitSet } from "$src/api/sets";
import { wardrobe } from "$src/data/cache";
import type { OutfitPackage } from "$src/data/common";
import { PACKAGE_TYPE } from "$src/data/consts";
import { get } from "svelte/store";

export const IsItemInWardrobe = function (item, wardrobe) {
  if (item.type == PACKAGE_TYPE.OUTFIT_SET) {
    return wardrobe.sets.some((set) => set.id == item.id);
  }
  if (item.type == PACKAGE_TYPE.OUTFIT) {
    return wardrobe.outfits.some((outfit) => outfit.id == item.id);
  }
  return false;
};
export const ShareItem = async function (item) {
  item.isShared = true;
  if (item.type == PACKAGE_TYPE.OUTFIT_SET) {
    await UploadOutfitSet(item);
  }
  if (item.type == PACKAGE_TYPE.OUTFIT) {
    await UploadOutfit(item);
  }
};
export const AddItemToWardrobe = function (item:OutfitPackage) {
  let wardrobeObj = get(wardrobe);
  if(item.layers.length == 0) return;
  if (item.type == PACKAGE_TYPE.OUTFIT_SET) {
    wardrobeObj.sets.push(item);
  }
  if (item.type == PACKAGE_TYPE.OUTFIT) {
    wardrobeObj.outfits.push(item);
  }
  wardrobe.set(wardrobeObj);
};
export const RemoveItemFromWardrobe = function (id, type) {
  let wardrobeObj = get(wardrobe);
  if (type == PACKAGE_TYPE.OUTFIT_SET) {
    wardrobeObj.sets = wardrobeObj.sets.filter((set) => set?.id != id);
  }
  if (type == PACKAGE_TYPE.OUTFIT) {
    wardrobeObj.outfits = wardrobeObj.outfits.filter((outfit) => outfit?.id != id);
  }
  wardrobe.set(wardrobeObj);
};
