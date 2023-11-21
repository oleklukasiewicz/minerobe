import { get, writable, type Writable } from "svelte/store";
import { OutfitPackage } from "./common";
import { currentUser } from "./cache";
import { db, GenerateIdForCollection, GetDocument, SetDocument } from "./firebase";

//helper
const GenerateId = function (collection): string {
  return GenerateIdForCollection(collection);
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
