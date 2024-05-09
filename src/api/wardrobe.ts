import { currentUser, userSettings, wardrobe } from "$src/data/cache";
import {
  OutfitPackage,
  OutfitPackageCollection,
  OutfitPackageCollectionLink,
  OutfitPackageLink,
  WardrobePackage,
} from "$src/data/common";
import { get } from "svelte/store";
import {PACKAGE_TYPE } from "$src/data/consts";
import { setsIntance } from "./sets";
import { outfitsInstance } from "./outfits";
import { AddLike, RemoveLike } from "./social";
import { GetRequest } from "$src/data/api";

const WARDROBE_PATH = "wardrobes";

export const ParseWardrobeToDatabase = function (pack: WardrobePackage) {
  let data = Object.assign({}, pack);
  delete data.outfits;
  data.collections = data.collections.map(
    (item) =>
      new OutfitPackageCollectionLink(
        item.id,
        PACKAGE_TYPE.OUTFIT_COLLECTION_LINK
      ) as any
  );
  delete data.local;
  return data;
};
export const ParseWardrobeToLocal = async function (data: WardrobePackage) {
  if (data.outfits == null) data.outfits = [];
  const parsedOutfits = Promise.all(
    data.outfits.map(async (item: any) => {
      if (
        item.type == PACKAGE_TYPE.OUTFIT ||
        item.type == PACKAGE_TYPE.OUTFIT_SET
      ) {
        return item;
      } else {
        if (item.type == PACKAGE_TYPE.OUTFIT_LINK)
          return await outfitsInstance.fetchFromLink(item);
        if (item.type == PACKAGE_TYPE.OUTFIT_SET_LINK) {
          item.model = get(userSettings)?.model || item.model;
          return await setsIntance.fetchFromLink(item);
        }
      }
    })
  );
  data.outfits = (await parsedOutfits).filter((item) => item != null);

  return data;
};
export const FetchWardrobe = async function () {
  // let dt = await GetDocument(WARDROBE_PATH, get(currentUser)?.id);
  // if (dt == null) return new WardrobePackage("default_wardrobe", []);
  // const parsedCollections = Promise.all(
  //   dt.collections.map(
  //     async (item: any) => await FetchOutfitCollection(item.id)
  //   )
  // );
  // dt.collections = (await parsedCollections).filter((item) => item != null);
  // return dt;
};
export const UploadWardrobe = async function (data: WardrobePackage) {
  // await UpdateDocument(
  //   WARDROBE_PATH,
  //   get(currentUser)?.id,
  //   await ParseWardrobeToDatabase(data)
  // );
};
//operations
export const AddItemToWardrobe = async function (
  item: OutfitPackage | OutfitPackageCollection
) {
  let wardrobeObj = get(wardrobe);
  if (!IsItemInWardrobe(item, wardrobeObj)) {
    AddLike(item.id, item.type);
  }

  if (
    item.type == PACKAGE_TYPE.OUTFIT ||
    item.type == PACKAGE_TYPE.OUTFIT_SET
  ) {
    wardrobeObj.outfits.push(item as OutfitPackage);
    const outfit = item as OutfitPackage;
    const link = new OutfitPackageLink(
      outfit.id,
      outfit.model,
      outfit.type == PACKAGE_TYPE.OUTFIT
        ? PACKAGE_TYPE.OUTFIT_LINK
        : PACKAGE_TYPE.OUTFIT_SET_LINK
    );
    // await UpdateRawDocument(DATA_PATH_CONFIG.WARDROBE, get(currentUser).id, {
    //   outfits: arrayUnion(Object.assign({}, link)),
    // });
  }
  if (item.type == PACKAGE_TYPE.OUTFIT_COLLECTION) {
    wardrobeObj.collections.push(item as OutfitPackageCollection);
  }
  wardrobe.set(wardrobeObj);
  return true;
};
export const RemoveItemFromWardrobe = async function (id, type) {
  let wardrobeObj = get(wardrobe);
  if (type == PACKAGE_TYPE.OUTFIT || type == PACKAGE_TYPE.OUTFIT_SET) {
    const target = wardrobeObj.outfits.find(
      (outfit) => outfit?.id == id && outfit?.type == type
    );

    wardrobeObj.outfits = wardrobeObj.outfits.filter(
      (outfit) => outfit?.id != id || outfit?.type != type
    );

    const link = new OutfitPackageLink(
      target.id,
      target.model,
      target.type == PACKAGE_TYPE.OUTFIT
        ? PACKAGE_TYPE.OUTFIT_LINK
        : PACKAGE_TYPE.OUTFIT_SET_LINK
    );

    // await UpdateRawDocument(DATA_PATH_CONFIG.WARDROBE, get(currentUser).id, {
    //   outfits: arrayRemove(Object.assign({}, link)),
    // });
  }
  if (type == PACKAGE_TYPE.OUTFIT_COLLECTION) {
    wardrobeObj.collections = wardrobeObj.collections.filter(
      (collection) => collection?.id != id
    );
  }
  RemoveLike(id, type);
  wardrobe.update((wardrobe) => {
    wardrobe.outfits = wardrobeObj.outfits;
    return wardrobe;
  });
  return false;
};
export const IsItemInWardrobe = function (item, wardrobe) {
  if (
    item.type == PACKAGE_TYPE.OUTFIT ||
    item.type == PACKAGE_TYPE.OUTFIT_SET
  ) {
    return wardrobe.outfits.some((outfit) => outfit.id == item.id);
  }
  if (item.type == PACKAGE_TYPE.OUTFIT_COLLECTION) {
    return wardrobe.collections.some((collection) => collection.id == item.id);
  }
  return false;
};
export const UpdateItemInWardrobe = function (item: OutfitPackage) {
  let wardrobeObj = get(wardrobe);

  wardrobeObj.outfits = wardrobeObj.outfits.map((outfit) =>
    outfit.id == item.id && outfit.type == item.type ? item : outfit
  );
  wardrobe.set(wardrobeObj);
};
export const FetchUserWardrobe = async function () {
  const req = await GetRequest("/api/Wardrobe/" + get(currentUser)?.id);
  const wardrobe = req as WardrobePackage
  return wardrobe;
};
