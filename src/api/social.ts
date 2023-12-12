import { PACKAGE_TYPE } from "$src/data/consts";
import {
  IsDocumentExist,
  UpdateRawDocument,
} from "$src/data/firebase";
import { increment } from "firebase/firestore";

export const AddLike = async (id: string, type: string) => {
  const dir = type == PACKAGE_TYPE.OUTFIT ? "outfits" : "sets";
  const isExist = await IsDocumentExist(dir, id);
  if (!isExist) return;
  await UpdateRawDocument(dir, id, {
    social: {
      likes: increment(1),
    },
  });
};
export const RemoveLike = async (id: string, type: string) => {
  const dir = type == PACKAGE_TYPE.OUTFIT ? "outfits" : "sets";
  const isExist = await IsDocumentExist(dir, id);
  if (!isExist) return;
  await UpdateRawDocument(dir, id, {
    social: {
      likes: increment(-1),
    },
  });
};
