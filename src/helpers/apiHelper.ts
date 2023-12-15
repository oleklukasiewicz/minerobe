import { DeleteOutfit, UploadOutfit } from "$src/api/outfits";
import { DeleteOutfitSet, UploadOutfitSet } from "$src/api/sets";
import { AddLike, RemoveLike } from "$src/api/social";
import { wardrobe } from "$src/data/cache";
import { OutfitPackage } from "$src/data/common";
import { MODEL_TYPE, PACKAGE_TYPE } from "$src/data/consts";
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
export const AddItemToWardrobe = function (item: OutfitPackage) {
  let wardrobeObj = get(wardrobe);
  if (!IsItemInWardrobe(item, wardrobeObj)) {
    AddLike(item.id, item.type);
  }
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
    wardrobeObj.outfits = wardrobeObj.outfits.filter(
      (outfit) => outfit?.id != id
    );
  }
  RemoveLike(id, type);
  wardrobe.update((wardrobe) => {
    wardrobe.sets = wardrobeObj.sets;
    wardrobe.outfits = wardrobeObj.outfits;
    return wardrobe;
  });
};
export const RemoveItem = function (item: OutfitPackage) {
  if (get(wardrobe).studio.id == item.id) {
    wardrobe.update((wardrobe) => {
      wardrobe.studio = new OutfitPackage(
        "new outfit",
        MODEL_TYPE.ALEX,
        [],
        PACKAGE_TYPE.OUTFIT,
        undefined,
        null,
        null,
        null
      );
      return wardrobe;
    });
  }
  if (item.type == PACKAGE_TYPE.OUTFIT_SET) DeleteOutfitSet(item);
  if (item.type == PACKAGE_TYPE.OUTFIT) DeleteOutfit(item);
  if (IsItemInWardrobe(item, get(wardrobe)))
    RemoveItemFromWardrobe(item.id, item.type);
};
