import { IsItemInWardrobe, RemoveItemFromWardrobe } from "$src/api/wardrobe";
import {  wardrobe } from "$src/data/cache";
import {
  OutfitPackage,
  OutfitPackageCollection
} from "$src/data/common";
import {PACKAGE_TYPE } from "$src/data/consts";
import { get } from "svelte/store";

//helpers
export const RemoveItem =async function (item: OutfitPackage) {
  if (get(wardrobe).studio.id == item.id) {
    wardrobe.update((wardrobe) => {
      wardrobe.studio = null;
      return wardrobe;
    });
  }
  
  if (IsItemInWardrobe(item, get(wardrobe)))
    await RemoveItemFromWardrobe(item.id, item.type);
};

//wardrobe
export const UpdateCollectionInWardrobe = function (
  item: OutfitPackageCollection
) {
  let wardrobeObj = get(wardrobe);
  wardrobeObj.collections = wardrobeObj.collections.map((collection) =>
    collection.id == item.id ? item : collection
  );
  wardrobe.set(wardrobeObj);
};
//other
export const SplitOutfitPackage = function (pack: OutfitPackage) {
  let splited = [];
  pack.layers.forEach((layer) => {
    let outfit = Object.assign({}, pack);
    outfit.layers = [layer];
    splited.push(outfit);
  });
  return splited;
};
export const SplitOutfitPackages = function (packs: OutfitPackage[]) {
  let splited = [];
  packs.forEach((pack) => {
    splited = splited.concat(SplitOutfitPackage(pack));
  });
  return splited;
};
export const AddToCollection = async function (
  collection: OutfitPackageCollection,
  item: OutfitPackage
) {
  if (
    !collection.outfits.some(
      (outfit) => outfit.id == item.id && outfit.type == item.type
    )
  ) {
    collection.outfits.push(item as any);
  }
}
export const RemoveFromCollection = async function (
  collection: OutfitPackageCollection,
  item: OutfitPackage
) {
  collection.outfits = collection.outfits.filter(
    (outfit) => outfit.id != item.id || outfit.type != item.type
  );
 
};
export const IsItemInCollection = function (
  collection: OutfitPackageCollection,
  item: OutfitPackage
) {
  return collection.outfits.some(
    (outfit) => outfit.id == item.id && outfit.type == item.type
  );
};
