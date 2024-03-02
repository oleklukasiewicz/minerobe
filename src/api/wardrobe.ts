import { currentUser } from "$src/data/cache";
import {
  OutfitPackageCollectionLink,
  OutfitPackageLink,
  WardrobePackage,
} from "$src/data/common";
import { GetDocument, SetDocument } from "$src/data/firebase";
import { get } from "svelte/store";
import { PACKAGE_TYPE } from "$src/data/consts";
import { FetchOutfitCollection } from "./collection";
import { setsIntance } from "./sets";
import { outfitsInstance } from "./outfits";

const WARDROBE_PATH = "wardrobes";

export const ParseWardrobeToDatabase = function (pack: WardrobePackage) {
  let data = Object.assign({}, pack);
  data.sets = data.sets.map(
    (item) => new OutfitPackageLink(item.id, item.model) as any
  );
  data.outfits = data.outfits.map(
    (item) => new OutfitPackageLink(item.id, item.model,PACKAGE_TYPE.OUTFIT_LINK) as any
  );
  data.collections = data.collections.map(
    (item) => new OutfitPackageCollectionLink(item.id,PACKAGE_TYPE.OUTFIT_COLLECTION_LINK) as any
  );
  delete data.local;
  return data;
};
export const ParseWardrobeToLocal = async function (data: WardrobePackage) {
  const parsedSets = Promise.all(
    data.sets.map(
      async (item: any) =>
        await setsIntance.fetchFromLink(item)
    )
  );
  const parsedOutfits = Promise.all(
    data.outfits.map(
      async (item: any) => await outfitsInstance.fetchFromLink(item)
    )
  );
  const parsedCollections = Promise.all(
    data.collections.map(
      async (item: any) => await FetchOutfitCollection(item.id)
    )
  );

  data.sets = (await parsedSets).filter((item) => item != null);
  data.outfits = (await parsedOutfits).filter((item) => item != null);
  let totalLikes = 0;
  let totalDownloads = 0;
  data.outfits.forEach((item) => {
    totalLikes += item.social?.likes;
    totalDownloads += item.social?.downloads || 0;
  });
  data.sets.forEach((item) => {
    totalLikes += item.social?.likes;
    totalDownloads += item.social?.downloads || 0;
  });
  data.collections.forEach((item) => {
    totalLikes += item.social?.likes;
    totalDownloads += item.social?.downloads || 0;
  });
  const local = {
    totalLikes,
    totalDownloads,
  };
  data.local = local;

  return data;
};
export const FetchWardrobe = async function () {
  let dt = await GetDocument(WARDROBE_PATH, get(currentUser)?.id);
  if (dt == null) return new WardrobePackage("default_wardrobe", [], []);
  
  const parsedCollections = Promise.all(
    dt.collections.map(
      async (item: any) => await FetchOutfitCollection(item.id)
    )
  );
  dt.collections = (await parsedCollections).filter((item) => item != null);
  return dt;
};
export const UploadWardrobe = async function (data: WardrobePackage) {
  await SetDocument(
    WARDROBE_PATH,
    get(currentUser)?.id,
    await ParseWardrobeToDatabase(data)
  );
};
