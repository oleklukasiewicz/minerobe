import { MinerobeUserSettings } from "$src/data/common";
import { GetDocument, UpdateDocument } from "$src/data/firebase";

const SETTINS_PATH = "settings";
export const UploadSettings = async function (data: MinerobeUserSettings) {
  await UpdateDocument(SETTINS_PATH, data.userId, data);
};
export const FetchSettings = async function (userId: string) {
  const data = await GetDocument(SETTINS_PATH, userId);
  if (data == null) return new MinerobeUserSettings("", "");
  return data;
};
