import { currentUser } from "$src/data/cache";
import { PackageSocialData, type OutfitPackage } from "$src/data/common";
import {
  DeleteCollection,
  GetDocument,
  UpdateDocument,
} from "$src/data/firebase";
import { AddItemToWardrobe } from "$src/helpers/apiHelper";
import { get } from "svelte/store";

const SOCIAL_PATH = "social";
const DATA_PATH = "itemdata";
const SNAPSHOT_PATH = "snapshot";
export const _FetchPackage = async function (path: string) {
  let pack = (await GetDocument(path, DATA_PATH)) as OutfitPackage;
  if (
    pack == null ||
    (pack?.publisher?.id != get(currentUser)?.id && pack.isShared == false)
  )
    return null;

  pack.social = await GetDocument(path, SOCIAL_PATH);

  if (pack.social == null) {
    pack.social = new PackageSocialData();
    await UpdateDocument(path, SOCIAL_PATH, pack.social);
  }
  return pack;
};

export const UploadPackage = async function (
  path: string,
  pack: OutfitPackage,
  isNew = false,
  parser = (x, y) => x,
  snapshotParser = (x) => x
) {
  if (pack.publisher.id != get(currentUser)?.id || pack.id == null) return;

  let parsed = await parser(pack, isNew);
  delete parsed.social;
  await UpdateDocument(path, DATA_PATH, parsed);
  await UploadPackageSnapshot(path, Object.assign({},pack), snapshotParser);
};
export const FetchPackage = async function (path: string, parser = (x) => x) {
  let pack = await _FetchPackage(path);
  if (pack == null) return null;
  return await parser(pack);
};
export const CreatePackage = async function (
  data: OutfitPackage,
  path: string,
  parser = (x) => x,
  snapshotParser = (x) => x,
  addToWardrobe = true
) {
  await UploadPackage(path, data, true, parser, snapshotParser);
  if (addToWardrobe) {
    await AddItemToWardrobe(data);
  }
  return data;
};
export const DeletePackage = async function (
  pack: OutfitPackage,
  path: string
) {
  if (pack.publisher.id != get(currentUser)?.id) return;
  await DeleteCollection(path);
};
export const FetchPackageSnapshot = async function (
  path: string,
  parser = (x) => x
) {
  let pack = await GetDocument(path, SNAPSHOT_PATH);
  if (pack == null) pack = await GetDocument(path, DATA_PATH);
  if (
    pack == null ||
    (pack?.publisher?.id != get(currentUser)?.id && pack.isShared == false)
  )
    return null;
  return await parser(pack);
};
export const UploadPackageSnapshot = async function (
  path: string,
  pack: OutfitPackage,
  parser = (x) => x
) {
  if (pack.publisher.id != get(currentUser)?.id || pack.id == null) return;
  let parsed = await parser(pack);
  await UpdateDocument(path, SNAPSHOT_PATH, parsed);
};
