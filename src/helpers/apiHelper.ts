import {
  DeleteOutfit,
  FetchOutfit,
  FetchOutfitsFromQuery,
  FetchRawOutfit,
  UploadOutfit,
} from "$src/api/outfits";
import { DeleteOutfitSet, UploadOutfitSet } from "$src/api/sets";
import { AddLike, RemoveLike } from "$src/api/social";
import { wardrobe } from "$src/data/cache";
import { OutfitPackage } from "$src/data/common";
import { PACKAGE_TYPE } from "$src/data/consts";
import { CallQuery, QueryWhere } from "$src/data/firebase";
import { get } from "svelte/store";

//sharing
export const ShareItem = async function (item) {
  item.isShared = true;
  if (item.type == PACKAGE_TYPE.OUTFIT_SET) {
    await UploadOutfitSet(item);
  }
  if (item.type == PACKAGE_TYPE.OUTFIT) {
    await UploadOutfit(item);
  }
};
export const UnshareItem = async function (item) {
  item.isShared = false;
  if (item.type == PACKAGE_TYPE.OUTFIT_SET) {
    await UploadOutfitSet(item);
  }
  if (item.type == PACKAGE_TYPE.OUTFIT) {
    await UploadOutfit(item);
  }
};

//helpers
export const RemoveItem = function (item: OutfitPackage) {
  if (get(wardrobe).studio.id == item.id) {
    wardrobe.update((wardrobe) => {
      wardrobe.studio = null;
      return wardrobe;
    });
  }
  if (item.type == PACKAGE_TYPE.OUTFIT_SET) DeleteOutfitSet(item);
  if (item.type == PACKAGE_TYPE.OUTFIT) DeleteOutfit(item);
  if (IsItemInWardrobe(item, get(wardrobe)))
    RemoveItemFromWardrobe(item.id, item.type);
};

//wardrobe
export const UpdateItemInWardrobe = function (item: OutfitPackage) {
  let wardrobeObj = get(wardrobe);
  if (item.type == PACKAGE_TYPE.OUTFIT_SET) {
    wardrobeObj.sets = wardrobeObj.sets.map((set) =>
      set.id == item.id ? item : set
    );
  }
  if (item.type == PACKAGE_TYPE.OUTFIT) {
    wardrobeObj.outfits = wardrobeObj.outfits.map((outfit) =>
      outfit.id == item.id ? item : outfit
    );
  }
  wardrobe.set(wardrobeObj);
};
export const FetchFullWardrobe = async function () {
  let wardrobeObj = get(wardrobe);
  for (let i = 0; i < wardrobeObj.outfits.length; i++) {
    let outfit = await FetchRawOutfit(wardrobeObj.outfits[i].id);
    wardrobeObj.outfits[i] = outfit;
  }
  return wardrobeObj;
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
export const IsItemInWardrobe = function (item, wardrobe) {
  if (item.type == PACKAGE_TYPE.OUTFIT_SET) {
    return wardrobe.sets.some((set) => set.id == item.id);
  }
  if (item.type == PACKAGE_TYPE.OUTFIT) {
    return wardrobe.outfits.some((outfit) => outfit.id == item.id);
  }
  return false;
};
export const FetchWardrobeOutfitsByCategory = async function (category) {
  const categoryQuery = await CallQuery(
    "outfits",
    get(wardrobe).outfits.map((outfit) => outfit.id),
    category != "ALL"
      ? [new QueryWhere("outfitType", "==", category.toLowerCase())]
      : []
  );
  const fetched = await FetchOutfitsFromQuery(categoryQuery);
  let mapped = [];
  fetched.forEach((x) => {
    x.layers.forEach((y) => {
      const tempPackage = { ...x };
      tempPackage.layers = [y];
      mapped.push(tempPackage);
    });
  });
  return mapped;
};
