import { PackageSocialData } from "$src/data/common";
import { PACKAGE_TYPE } from "$src/data/consts";
import {
  GetDocument,
  IsDocumentExist,
  UpdateDocument,
  UpdateRawDocument,
} from "$src/data/firebase";
import { increment } from "firebase/firestore";
import { UploadPartialQueryDataRaw } from "./query";
import { UploadOutfitSet } from "./sets";
import { UploadOutfit } from "./outfits";
import {
  AddDownloadData,
  FetchSocialData,
  GiveLike,
  SharePackage,
  UnsharePackage,
} from "./pack";
import { _ } from "svelte-i18n";
const SOCIAL_PATH = "social";
const SNAPSHOT_PATH = "snapshot";
const _getDir = (type: string) => {
  return type == PACKAGE_TYPE.OUTFIT ? "outfits-new" : "sets-new";
};
export const AddLike = async (id: string, type: string) => {
  const dir = _getDir(type);
  await GiveLike(dir, id);
};
export const RemoveLike = async (id: string, type: string) => {
  const dir = _getDir(type);
  await RemoveLike(dir, id);
};
export const AddDownload = async (id: string, type: string) => {
  const dir = _getDir(type);
  await AddDownloadData(dir, id);
};
const ResetSocialLikes = async (id: string, type: string) => {
  const dir = _getDir(type);
  await ResetSocialLikes(dir, id);
};
export const ShareItem = async function (item) {
  await SharePackage(_getDir(item.type), item);
};
export const UnshareItem = async function (item) {
  await UnsharePackage(_getDir(item.type), item);
};
