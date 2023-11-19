import { writable, type Writable } from "svelte/store";
import { OutfitPackage } from "./common";


//helper
const GenerateId = function (): string {
return "";
}

//outfit
export const GetOutfit = async function (id: string): Promise<OutfitPackage> {
  //fetch outfit from db
  return await new OutfitPackage("", "", []);
};

//variant
export const GetOutfitVariant = async function (id: string,variantId: string): Promise<OutfitPackage> {
  //fetch outfit variant from db
  return await new OutfitPackage("", "", []);
};

//wandrobe
export const GetWardrobe = async function (): Promise<any> {

}
export const AddToWardrobe = async function (outfitId: string): Promise<any> {
}
export const RemoveFromWardrobe = async function (outfitId: string): Promise<any> {
}