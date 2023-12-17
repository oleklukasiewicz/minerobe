import {
  readable,
  writable,
  type Writable,
  type Readable,
  get,
} from "svelte/store";
import { APP_STATE, PACKAGE_TYPE } from "$data/consts";
import type { MinerobeUser } from "./common";
import alexModelData from "$src/model/alex.gltf?raw";
import steveModelData from "$src/model/steve.gltf?raw";
import planksTextureRaw from "$src/texture/default_planks.png?url";
import type { WardrobePackage } from "./common";
import type { OutfitPackage } from "./common";
import { propertyStore } from "svelte-writable-derived";
import { FetchWardrobe, UploadWardrobe } from "$src/api/wardrobe";
import { UploadOutfitSet } from "$src/api/sets";
import { UploadOutfit } from "$src/api/outfits";
import * as THREE from "three";

export const alexModel: Readable<string> = readable(
  "data:model/gltf+json;base64," + btoa(alexModelData)
);
export const steveModel: Readable<string> = readable(
  "data:model/gltf+json;base64," + btoa(steveModelData)
);

export const planksTexture: Readable<string> = readable(planksTextureRaw);
export const defaultRenderer: Writable<string> = writable(null);

export const appState: Writable<string> = writable(APP_STATE.LOADING);
export const currentUser: Writable<MinerobeUser> = writable(null);
export const wardrobe: Writable<WardrobePackage> = writable({
  id: null,
  outfits: [],
  sets: [],
  studio: {
    id: "default",
    model: "alex",
    type: PACKAGE_TYPE.OUTFIT,
    isShared: false,
    name: "alex",
    layers: [],
    publisher: {
      id: "",
      name: "",
      avatar: "",
    },
    social: {
      likes: 0,
     isFeatured: false,
    }
  },
});
export const baseTexture: Readable<string> = readable(get(planksTexture));

export const itemPackage: Writable<OutfitPackage> = propertyStore(
  wardrobe,
  "studio"
);

let itemPackageSubscription;
let wardrobeSubscription;

export const setup = function () {
  defaultRenderer.set(new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true,
  }));
  currentUser.subscribe(async (user) => {
    if (user) {
      //settings up account
      if (get(appState) == APP_STATE.LOADING)
        appState.set(APP_STATE.USER_READY);
      let w = await FetchWardrobe();
      if (w != null) {
        wardrobe.set(w);
        console.log("setting wardrobe");
        if (w.studio != null) itemPackage.set(w.studio);
        appState.set(APP_STATE.READY);

        if (itemPackageSubscription) itemPackageSubscription();
        if (wardrobeSubscription) wardrobeSubscription();

        setupSubscriptions();
      }
    } else {
      if (itemPackageSubscription) itemPackageSubscription();
      if (wardrobeSubscription) wardrobeSubscription();

      appState.set(APP_STATE.LOADING);
    }
  });
};
const setupSubscriptions = function () {
  itemPackageSubscription = itemPackage.subscribe(
    async (data: OutfitPackage) => {
      if (data != null && data.id != null) {
        if (data.type == PACKAGE_TYPE.OUTFIT_SET) {
          await UploadOutfitSet(data);
        } else await UploadOutfit(data);
      }
    }
  );
  wardrobeSubscription = wardrobe.subscribe(async (data) => {
    if (get(appState) == APP_STATE.READY && data) await UploadWardrobe(data);
  });
};
