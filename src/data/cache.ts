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

let defaultOutfitPackage = new OutfitPackage("New skin", MODEL_TYPE.ALEX, []);
export let itemPackage: Writable<OutfitPackage> =
  writable(defaultOutfitPackage);
export let alexModel: Readable<string> = readable(
  "data:model/gltf+json;base64," + btoa(alexModelData)
);
export let steveModel: Readable<string> = readable(
  "data:model/gltf+json;base64," + btoa(steveModelData)
);

export let planksTexture: Readable<string> = readable((planksTextureRaw));

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

export const currentUser: Writable<any> = writable(null);
