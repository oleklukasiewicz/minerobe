import {
  readable,
  writable,
  type Writable,
  type Readable,
  get,
  readonly,
  derived,
} from "svelte/store";
import { APP_STATE } from "$data/consts";
import { MinerobeUserSettings, type MinerobeUser } from "./common";
import alexModelData from "$src/model/alex.gltf?raw";
import steveModelData from "$src/model/steve.gltf?raw";
import planksTextureRaw from "$src/texture/default_planks.png?url";
import type { WardrobePackage } from "./common";
import { FetchWardrobe, UploadWardrobe } from "$src/api/wardrobe";
import * as THREE from "three";
import { FetchSettings, UploadSettings } from "$src/api/settings";

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
  studio: null,
});
export const baseTexture: Readable<string> = readable(get(planksTexture));
export const isReadyForData: Readable<any> = derived(appState, ($appState) => {
  let result: any = false;
  if ($appState == APP_STATE.READY)
    result = {
      wardrobe: get(wardrobe),
      user: get(currentUser),
      state: $appState,
      userReadyness: $appState == APP_STATE.READY|| $appState == APP_STATE.GUEST_READY,
      fullReadyness: true,
    };
  if ($appState == APP_STATE.USER_READY)
    result = {
      user: get(currentUser),
      state: $appState,
      userReadyness: $appState == APP_STATE.READY|| $appState == APP_STATE.GUEST_READY,
    };
  if ($appState == APP_STATE.GUEST_READY) 
  {
    result = {
      state: $appState,
      user:null,
      userReadyness: true,
      fullReadyness: true,
    };
  };
  return result;
});
export const userSettings: Writable<MinerobeUserSettings> = writable({
  userId: null,
  model: "alex",
  baseTexture: "",
  theme: "",
});

let wardrobeSubscription, settingsSubscription;

export const setup = function () {
  defaultRenderer.update((renderer: any) => {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
    });
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = 1;
    return renderer;
  });

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
      let settings = await FetchSettings(user.id);
      if (settings != null) userSettings.set(settings);
      let w = await FetchWardrobe();
      if (w != null) {
        wardrobe.set(w);
        console.log("setting wardrobe");
        appState.set(APP_STATE.READY);
        if (wardrobeSubscription) wardrobeSubscription();
        if (settingsSubscription) settingsSubscription();

        setupSubscriptions();
      }
    } else {
      if (wardrobeSubscription) wardrobeSubscription();
      if (settingsSubscription) settingsSubscription();

      appState.set(APP_STATE.GUEST_READY);
    }
  });
};
const setupSubscriptions = function () {
  wardrobeSubscription = wardrobe.subscribe(async (data) => {
    if (get(appState) == APP_STATE.READY && data) await UploadWardrobe(data);
  });
  settingsSubscription = userSettings.subscribe(async (data) => {
    if (get(appState) == APP_STATE.READY && data) await UploadSettings(data);
  });
};
