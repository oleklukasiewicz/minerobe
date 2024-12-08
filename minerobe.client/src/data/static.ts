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
import { ModelScene } from "./render";
import { ALEX_MODEL, STEVE_MODEL } from "./consts/model";
import { APP_STATE } from "./enums/app";

//steve modelscene
const steveModelSceneWritable: Writable<ModelScene> = writable(null);
export const STEVE_MODELSCENE: Readable<ModelScene> = readonly(
  steveModelSceneWritable
);
//alex modelscene
const alexModelSceneWritable: Writable<ModelScene> = writable(null);
export const ALEX_MODELSCENE: Readable<ModelScene> = readonly(
  alexModelSceneWritable
);

const steveModelSceneBaseWritable: Writable<any> = writable(null);
export const STEVE_MODELSCENE_BASE: Readable<any> = readonly(
  steveModelSceneBaseWritable
);
const alexModelSceneBaseWritable: Writable<any> = writable(null);
export const ALEX_MODELSCENE_BASE: Readable<any> = readonly(
  alexModelSceneBaseWritable
);

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
export const Initialize = async function () {
  //setup mobile view
  const matcher = window.matchMedia("(max-width: 768px)");
  isMobileViewWritable.set(matcher.matches);
  matcher.addEventListener("change", (e) => {
    isMobileViewWritable.set(e.matches);
  });
  alexModelSceneWritable.set(
    await new ModelScene(ALEX_MODEL.model, ALEX_MODEL.name).Create()
  );
  steveModelSceneWritable.set(
    await new ModelScene(STEVE_MODEL.model, STEVE_MODEL.name).Create()
  );
  alexModelSceneBaseWritable.set(
    await new ModelScene(ALEX_MODEL.model, ALEX_MODEL.name)
      .Create()
      .then((x) => x.ResetPosition())
  );
  steveModelSceneBaseWritable.set(
    await new ModelScene(STEVE_MODEL.model, STEVE_MODEL.name)
      .Create()
      .then((x) => x.ResetPosition())
  );

  //setup default renderer
  defaultRendererWritable.update((renderer: any) => {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
    });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    return renderer;
  });
  CURRENT_USER.subscribe(async (user) => {
    appStateWritable.set(user ? APP_STATE.READY : APP_STATE.GUEST_READY);
  });
};
