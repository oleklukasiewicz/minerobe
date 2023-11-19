import {
  readable,
  writable,
  type Writable,
  type Readable,
  get,
} from "svelte/store";
import { MODEL_TYPE, OutfitPackage } from "./common";
import alexModelData from "$src/model/alex.gltf?raw";
import steveModelData from "$src/model/steve.gltf?raw";
import planksTextureRaw from "$src/texture/default_planks.png?url";
import { WardrobePackage } from "./wardrobe";
import { GetWardrobe, SetWardrobe } from "./api";

let defaultOutfitPackage = new OutfitPackage("New skin", MODEL_TYPE.ALEX, []);
export let itemPackage: Writable<OutfitPackage> =
  writable(defaultOutfitPackage);
export let alexModel: Readable<string> = readable(
  "data:model/gltf+json;base64," + btoa(alexModelData)
);
export let steveModel: Readable<string> = readable(
  "data:model/gltf+json;base64," + btoa(steveModelData)
);

export let planksTexture: Readable<string> = readable(planksTextureRaw);

export const currentUser: Writable<any> = writable(null);
export const wardrobe: Writable<WardrobePackage> = writable(null);

const cacheToLocalStorage = function () {
  if (
    typeof localStorage === "undefined" ||
    get(itemPackage) == defaultOutfitPackage
  )
    return;
  console.log("caching to local storage");
  const localStorageData = get(itemPackage);
  const layersJson = JSON.stringify(localStorageData);
  localStorage.setItem("package", layersJson);
};
itemPackage.subscribe(cacheToLocalStorage);
currentUser.subscribe(async (user) => {
  if (user) {
    let w = await GetWardrobe();
    if (w == null) {
      w = new WardrobePackage("default_wardrobe", []);
      await SetWardrobe(w);
    }
    wardrobe.set(w);
  }
});
wardrobe.subscribe(async (data) => {
  await SetWardrobe(data);
});
