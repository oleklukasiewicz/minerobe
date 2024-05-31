import { UploadSettings } from "$src/api/settings";
import { currentUser } from "$src/data/cache";
import { SkinData } from "$src/data/common";
import { get } from "svelte/store";

export const SetCurrentSkin = async function (id, model, texture) {
    // const settins = get(userSettings);
    // const old = settins.currentSkin;
    // settins.currentSkin = new SkinData(id, model, texture);
    // await UploadSettings(settins);
    // const resp = await FetchWithTokenAuth(
    //   "/api/service/set_skin/" + id + "/" + model + "/" + get(currentUser)?.id,
    //   "GET"
    // );
    // if (resp.status != 200) {
    //   settins.currentSkin = old;
    // }
    // userSettings.set(settins);
    // return resp.status == 200;
  };
  export const UnlinkMinecraftAccount = async function () {
  //   await FetchWithTokenAuth(
  //     "/api/internal/unlink/" + get(currentUser)?.id,
  //     "GET"
  //   );
  //   const settins = get(userSettings);
  //   settins.linkedMinecraftAccount = null;
  //   await UploadSettings(settins);
  //   userSettings.set(settins);
  // };
  // export const LinkMinecraftAccount = async function () {
  //   const resp = await FetchWithTokenAuth(
  //     "/api/internal/link/" + get(currentUser)?.id,
  //     "GET"
  //   );
  //   return await resp.json();
  };