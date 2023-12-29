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
const SOCIAL_PATH = "social";
export const AddLike = async (id: string, type: string) => {
  const dir =
    type == PACKAGE_TYPE.OUTFIT
      ? "outfits" + "/" + id + "/" + "data"
      : "sets" + "/" + id + "/" + "data";
  const isExist = await IsDocumentExist(dir, SOCIAL_PATH);
  if (!isExist) return;
  const res=await UpdateRawDocument(dir, SOCIAL_PATH, {
    likes: increment(1),
  });
  await UploadPartialQueryDataRaw(id, type, {
    likes: increment(1),
  });
};
export const RemoveLike = async (id: string, type: string) => {
  const dir =
    type == PACKAGE_TYPE.OUTFIT
      ? "outfits" + "/" + id + "/" + "data"
      : "sets" + "/" + id + "/" + "data";
  const isExist = await IsDocumentExist(dir, SOCIAL_PATH);
  if (!isExist) return;
  const res=await UpdateRawDocument(dir, SOCIAL_PATH, {
    likes: increment(-1),
  });
  await UploadPartialQueryDataRaw(id, type, {
    likes: increment(-1),
  });
};
export const FetchSocial = async (path: string) => {
  let obj = await GetDocument(path, SOCIAL_PATH);

  if (obj == null) {
    obj = new PackageSocialData();
    await UpdateDocument(path, SOCIAL_PATH, obj);
  }
  return obj;
};
