import {
  readable,
  writable,
  type Writable,
  type Readable,
  get,
  readonly,
} from "svelte/store";
import { APP_STATE, PACKAGE_TYPE } from "$data/consts";
import type { MinerobeUser } from "./common";
import alexModelData from "$src/model/alex.gltf?raw";
import steveModelData from "$src/model/steve.gltf?raw";
import planksTextureRaw from "$src/texture/default_planks.png?url";
import type { WardrobePackage } from "./common";
import { FetchWardrobe, UploadWardrobe } from "$src/api/wardrobe";
import * as THREE from "three";

const isMobileViewWritable: Writable<boolean> = writable(false);
export const isMobileView: Readable<boolean> = readonly(isMobileViewWritable);

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
    },
  },
});
export const baseTexture: Readable<string> = readable(get(planksTexture));

let wardrobeSubscription;

export const setup = function () {
  defaultRenderer.set(
    new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
    })
  );
  const matcher = window.matchMedia("(max-width: 768px)");
  isMobileViewWritable.set(matcher.matches);
  matcher.addEventListener("change", (e) => {
    isMobileViewWritable.set(e.matches);
  });
  currentUser.subscribe(async (user) => {
    if (user) {
      //settings up account
      if (get(appState) == APP_STATE.LOADING)
        appState.set(APP_STATE.USER_READY);
      let w = await FetchWardrobe();
      if (w != null) {
        wardrobe.set(w);
        console.log("setting wardrobe");
        appState.set(APP_STATE.READY);
        if (wardrobeSubscription) wardrobeSubscription();

        setupSubscriptions();
      }
    } else {
      if (wardrobeSubscription) wardrobeSubscription();

      appState.set(APP_STATE.LOADING);
    }
  });
};
const setupSubscriptions = function () {
  wardrobeSubscription = wardrobe.subscribe(async (data) => {
    if (get(appState) == APP_STATE.READY && data) await UploadWardrobe(data);
  });
};
