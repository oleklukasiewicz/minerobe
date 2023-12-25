import { currentUser } from "$src/data/cache";
import {
  OutfitPackageLink,
  type OutfitPackage,
  WardrobePackage,
} from "$src/data/common";
import { GetDocument, SetDocument } from "$src/data/firebase";
import { get } from "svelte/store";
import {FetchOutfitSetSnapshotFromLink } from "./sets";
import {FetchOutfitSnapshotFromLink } from "./outfits";

const WARDROBE_PATH = "wardrobes";

export const ParseWardrobeToDatabase = function (pack: WardrobePackage) {
  let data = Object.assign({}, pack);
  data.sets = data.sets.map(
    (item) => new OutfitPackageLink(item.id, item.model) as OutfitPackage
  );
  data.outfits = data.outfits.map(
    (item) => new OutfitPackageLink(item.id, item.model) as OutfitPackage
  );
  return data;
};
export const ParseWardrobeToLocal = async function (data: WardrobePackage) {
  const parsedSets = Promise.all(
    data.sets.map(
      async (item: OutfitPackageLink) => await FetchOutfitSetSnapshotFromLink(item)
    )
  );
  const parsedOutfits = Promise.all(
    data.outfits.map(
      async (item: OutfitPackageLink) => await FetchOutfitSnapshotFromLink(item)
    )
  );

  data.sets = (await parsedSets).filter((item) => item != null);
  data.outfits = (await parsedOutfits).filter((item) => item != null);
  return data;
};
export const FetchWardrobe = async function () {
  let dt = await GetDocument(WARDROBE_PATH, get(currentUser).id);
  if (dt == null) return new WardrobePackage("default_wardrobe", [], []);
  return ParseWardrobeToLocal(dt);
};
export const UploadWardrobe = async function (data: WardrobePackage) {
  await SetDocument(
    WARDROBE_PATH,
    get(currentUser).id,
    await ParseWardrobeToDatabase(data)
  );
};