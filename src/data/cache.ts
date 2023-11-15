import { readable, writable, type Writable, type Readable } from "svelte/store";
import { OutfitPackage } from "./common";
import alexModelData from '$src/model/alex.gltf?raw';
import steveModelData from '$src/model/steve.gltf?raw';

export let itemPackage: Writable<OutfitPackage> = writable(
  new OutfitPackage("New Skin", "alex", [])
);
export let alexModel: Readable<string> = readable(
  "data:model/gltf+json;base64," +
    btoa(alexModelData)
);
export let steveModel: Readable<string> = readable(
  "data:model/gltf+json;base64," +
    btoa(steveModelData)
);