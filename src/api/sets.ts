import { currentUser, wardrobe } from "$src/data/cache";
import {
  OutfitPackage,
  type OutfitLayer,
  OutfitPackageLink,
  MinerobeUser,
  OutfitLayerLink,
} from "$src/data/common";
import {
  LAYER_TYPE,
  MODEL_TYPE,
  OUTFIT_TYPE,
  PACKAGE_TYPE,
} from "$src/data/consts";
import {
  DeleteDocument,
  GenerateIdForCollection,
  GetDocument,
  SetDocument,
} from "$src/data/firebase";
import { AddItemToWardrobe } from "$src/helpers/apiHelper";
import { GetMinerobeUser } from "./auth";
import {
  FetchOutfitLayerFromLink,
} from "./outfits";
import { get } from "svelte/store";

const SETS_PATH = "sets";
export const GenerateIdForOutfitSet = function () {
  return GenerateIdForCollection(SETS_PATH);
};


const _fetchOutfitSet = async function (id: string): Promise<OutfitPackage> {
  let outfitSet = (await GetDocument(SETS_PATH, id)) as OutfitPackage;
  if (
    outfitSet == null ||
    (outfitSet?.publisher?.id != get(currentUser)?.id &&
      outfitSet.isShared == false)
  )
    return null;
  return outfitSet;
};

export const ParseOutfitSetToLocal = async function (data: OutfitPackage) {
  data.layers = await Promise.all(
    data.layers.map(async (item) =>
      item.type == LAYER_TYPE.REMOTE
        ? await FetchOutfitLayerFromLink(item,true)
        : item
    )
  );
  data.publisher = await GetMinerobeUser(data.publisher.id);
  return data;
};
export const ParseOutfitSetToDatabase = function (pack: OutfitPackage) {
  let data = Object.assign({}, pack);
  data.layers = data.layers.map((item) =>
    item.type == LAYER_TYPE.REMOTE
      ? (new OutfitLayerLink(item.id, item.variantId) as OutfitLayer)
      : item
  );
  data.publisher = new MinerobeUser(data.publisher.id, null, null);
  return data;
};
export const UploadOutfitSet = async function (data: OutfitPackage) {
  if(data.publisher.id != get(currentUser)?.id) return;
  if(data.layers.length == 0) return;
  await SetDocument(SETS_PATH, data.id, ParseOutfitSetToDatabase(data));
};
export const FetchOutfitSet = async function (id: string) {
  let data = await _fetchOutfitSet(id);
  if (data == null) return null;
  return ParseOutfitSetToLocal(data);
};
export const FetchOutfitSetFromLink = async function (link: OutfitPackageLink) {
  let data = await _fetchOutfitSet(link.id);
  if (data == null) return null;
  data.model = link.model;
  return ParseOutfitSetToLocal(data);
};
export const CreateOutfitSet = async function (addToWardrobe:boolean=false, isShared: boolean = false) {
  let data =new OutfitPackage("New Outfit set",MODEL_TYPE.ALEX,[],PACKAGE_TYPE.OUTFIT_SET,get(currentUser),GenerateIdForOutfitSet(),isShared);
  await UploadOutfitSet(data);
  if(addToWardrobe){
    await AddItemToWardrobe(data);
  }
  return data;
}