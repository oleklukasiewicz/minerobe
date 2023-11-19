import { get, writable, type Writable } from "svelte/store";
import { OutfitPackage } from "./common";
import { currentUser } from "./cache";
import { db, GetDocument, SetDocument } from "./firebase";

//helper
const GenerateId = function (collection): string {
  return db.collection(collection).doc().id;
};

//outfit
export const GetOutfit = async function (id: string): Promise<OutfitPackage> {
  //fetch outfit from db
  return await new OutfitPackage("", "", []);
};

//variant
export const GetOutfitVariant = async function (
  id: string,
  variantId: string
): Promise<OutfitPackage> {
  //fetch outfit variant from db
  return await new OutfitPackage("", "", []);
};

//wardrobe
const WARDROBE_PATH = "wardrobes";
export const GetWardrobe = async function () {
  if (get(currentUser))
    return await GetDocument(WARDROBE_PATH, get(currentUser).uid);
};
export const SetWardrobe = async function (data) {
  if (get(currentUser)&& data!=null)
    return await SetDocument(WARDROBE_PATH, get(currentUser).uid, data);
};
