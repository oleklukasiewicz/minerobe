import { currentUser } from "$src/data/cache";
import {
  OutfitPackage,
  type OutfitLayer,
  OutfitPackageLink,
  MinerobeUser,
  OutfitLayerLink,
  PackageSocialData,
} from "$src/data/common";
import { LAYER_TYPE, MODEL_TYPE, PACKAGE_TYPE } from "$src/data/consts";
import {
  DeleteCollection,
  GenerateIdForCollection,
  GetDocument,
  UpdateDocument,
} from "$src/data/firebase";
import { AddItemToWardrobe, CreateItemSnapshot } from "$src/helpers/apiHelper";
import { GetMinerobeUser } from "./auth";
import { FetchOutfitLayerFromLink } from "./outfits";
import { get } from "svelte/store";

const SETS_PATH = "sets";
const SETS_LOCAL_PATH = "data";

const SETS_DATA_PATH = "itemdata";
const SETS_SOCIAL_PATH = "social";
const SETS_SNAPSHOT_PATH = "snapshot";

export const GenerateIdForOutfitSet = () => GenerateIdForCollection(SETS_PATH);

const _fetchOutfitSet = async function (id: string): Promise<OutfitPackage> {
  let outfitSet = (await GetDocument(
    SETS_PATH + "/" + id + "/" + SETS_LOCAL_PATH,
    SETS_DATA_PATH
  )) as OutfitPackage;

  if (
    outfitSet == null ||
    (outfitSet?.publisher?.id != get(currentUser)?.id &&
      outfitSet.isShared == false)
  )
    return null;
  let social = (await GetDocument(
    SETS_PATH + "/" + id + "/" + SETS_LOCAL_PATH,
    SETS_SOCIAL_PATH
  )) as PackageSocialData;
  outfitSet.social = social;

  if (outfitSet.social == null) {
    outfitSet.social = new PackageSocialData();
    await UpdateDocument(
      SETS_PATH + "/" + id + "/" + SETS_LOCAL_PATH,
      SETS_SOCIAL_PATH,
      outfitSet.social
    );
  }

  return outfitSet;
};

export const ParseOutfitSetToLocal = async function (data: OutfitPackage) {
  data.layers = await Promise.all(
    data.layers.map(async (item) =>
      item.type == LAYER_TYPE.REMOTE
        ? await FetchOutfitLayerFromLink(item, true)
        : item
    )
  );
  data.layers = data.layers.filter((item) => item != null);
  data.publisher = await GetMinerobeUser(data.publisher.id);
  return data;
};
export const ParseOutfitSetToDatabase = function (
  pack: OutfitPackage,
  isNew: boolean = false
) {
  let data = Object.assign({}, pack) as OutfitPackage;
  if (!isNew) delete data.social;
  data.layers = data.layers.map((item) =>
    item.type == LAYER_TYPE.REMOTE
      ? (new OutfitLayerLink(item.id, item.variantId) as OutfitLayer)
      : item
  );
  data.publisher = new MinerobeUser(data.publisher.id, null, null);
  return data;
};
export const UploadOutfitSet = async function (
  data: OutfitPackage,
  isNew = false
) {
  if (data.publisher.id != get(currentUser)?.id || data.id == null) return;
  let parsed = ParseOutfitSetToDatabase(data, isNew);
  delete parsed.social;
  await UpdateDocument(
    SETS_PATH + "/" + data.id + "/" + SETS_LOCAL_PATH,
    SETS_DATA_PATH,
    parsed
  );
  await UploadOutfitSetSnapshot(data);
  return data;
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
export const CreateOutfitSet = async function (
  addToWardrobe: boolean = false,
  isShared: boolean = false
) {
  let data = new OutfitPackage(
    "New Outfit set",
    MODEL_TYPE.ALEX,
    [],
    PACKAGE_TYPE.OUTFIT_SET,
    get(currentUser),
    GenerateIdForOutfitSet(),
    isShared,
    new PackageSocialData()
  );
  await UploadOutfitSet(data, true);
  if (addToWardrobe) {
    await AddItemToWardrobe(data);
  }
  return data;
};
export const DeleteOutfitSet = async function (outfit: OutfitPackage) {
  if (outfit.publisher.id != get(currentUser)?.id) return;
  await DeleteCollection(SETS_PATH + "/" + outfit.id + "/" + SETS_LOCAL_PATH);
};
export const FetchOutfitSetSnapshot = async function (id: string) {
  let data = await GetDocument(
    SETS_PATH + "/" + id + "/" + SETS_LOCAL_PATH,
    SETS_SNAPSHOT_PATH
  );
  data.publisher = await GetMinerobeUser(data.publisher.id);
  return data;
};
export const FetchOutfitSetSnapshotFromLink = async function (
  link: OutfitPackageLink
) {
  let data = await FetchOutfitSetSnapshot(link.id);
  if (data == null) return null;
  data.model = link.model;
  return data;
};

export const UploadOutfitSetSnapshot = async function (pack) {
  let snapshot = ParseOutfitSetToDatabase(await CreateItemSnapshot(pack));
  await UpdateDocument(
    SETS_PATH + "/" + pack.id + "/" + SETS_LOCAL_PATH,
    SETS_SNAPSHOT_PATH,
    snapshot
  );
};
