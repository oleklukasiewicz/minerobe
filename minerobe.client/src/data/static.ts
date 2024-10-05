import * as THREE from "three";

import baseModelTextureRaw from "$src/texture/base_skin.png?url";
import {
  readable,
  readonly,
  writable,
  type Readable,
  type Writable,
} from "svelte/store";
import type { MinerobeUser } from "$src/model/user";
import { APP_STATE } from "./consts/app";

//base model texture
export const BASE_TEXTURE: Readable<string> = readable(baseModelTextureRaw);

//default renderer
const defaultRendererWritable: Writable<any> = writable(null);
export const DEFAULT_RENDERER: Readable<any> = readonly(
  defaultRendererWritable
);

//mobile view
const isMobileViewWritable: Writable<boolean> = writable(false);
export const IS_MOBILE_VIEW: Readable<boolean> = readonly(isMobileViewWritable);

//app state
const appStateWritable: Writable<string> = writable(null);
export const CURRENT_APP_STATE: Readable<string> = readonly(appStateWritable);

//snapshot temporary node
const snapshotTemporaryNodeWritable: Writable<any> = writable(null);
export const SNAPSHOT_TEMPORARY_NODE: Readable<any> = readonly(
  snapshotTemporaryNodeWritable
);

//current user
export const currentUserWritable: Writable<MinerobeUser> = writable(null);
export const CURRENT_USER: Readable<MinerobeUser> =
  readonly(currentUserWritable);

//web socket connection
export const serverWsConnectionWritable: Writable<any> = writable(null);
export const WS_CONNECTION: Readable<any> = readonly(
  serverWsConnectionWritable
);

//initialize static data
export const Initialize = function () {
  //setup mobile view
  const matcher = window.matchMedia("(max-width: 768px)");
  isMobileViewWritable.set(matcher.matches);
  matcher.addEventListener("change", (e) => {
    isMobileViewWritable.set(e.matches);
  });

  //setup default renderer
  defaultRendererWritable.update((renderer: any) => {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
    });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    return renderer;
  });
  CURRENT_USER.subscribe(async (user) => {
    appStateWritable.set(user ? APP_STATE.USER_READY : APP_STATE.GUEST_READY);
  });
};
