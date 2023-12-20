import { PACKAGE_TYPE } from "$src/data/consts";
import {
  IsDocumentExist,
  UpdateRawDocument,
} from "$src/data/firebase";
import { increment } from "firebase/firestore";

export const AddLike = async (id: string, type: string) => {
  const dir =
    type == PACKAGE_TYPE.OUTFIT
      ? "outfits" + "/" + id + "/" + "data"
      : "sets" + "/" + id + "/" + "data";
  const isExist = await IsDocumentExist(dir, "social");
  if (!isExist) return;
  await UpdateRawDocument(dir, "social", {
    likes: increment(1),
  });
};
export const RemoveLike = async (id: string, type: string) => {
  const dir =
    type == PACKAGE_TYPE.OUTFIT
      ? "outfits" + "/" + id + "/" + "data"
      : "sets" + "/" + id + "/" + "data";
  const isExist = await IsDocumentExist(dir, "social");
  if (!isExist) return;
  await UpdateRawDocument(dir, "social", {
    likes: increment(-1),
  });
};
