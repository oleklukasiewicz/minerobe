import {
  readable,
  writable,
  type Writable,
  type Readable,
  get,
} from "svelte/store";
import { PACKAGE_TYPE} from "$data/consts";
import type { MinerobeUser } from "./common";
import alexModelData from "$src/model/alex.gltf?raw";
import steveModelData from "$src/model/steve.gltf?raw";
import planksTextureRaw from "$src/texture/default_planks.png?url";
import { WardrobePackage } from "./common";
import { OutfitPackage } from "./common";
import { GetWardrobe, SetWardrobe } from "$src/api/wardrobe";
import { SaveOutfitSet } from "$src/api/sets";

export let itemPackage: Writable<OutfitPackage> = writable(
  {
    name: "",
    model: "",
    type: PACKAGE_TYPE.OUTFIT_SET,
    layers: [],
  } as OutfitPackage
);
export let alexModel: Readable<string> = readable(
  "data:model/gltf+json;base64," + btoa(alexModelData)
);
export let steveModel: Readable<string> = readable(
  "data:model/gltf+json;base64," + btoa(steveModelData)
);

export let planksTexture: Readable<string> = readable(planksTextureRaw);

export const currentUser: Writable<MinerobeUser> = writable(null);
export const wardrobe: Writable<WardrobePackage> = writable(null);

itemPackage.subscribe(async (data:OutfitPackage) => {
  if(data!=null && data.publisher!=null&& data.publisher.id==get(currentUser).id)
  {
    await SaveOutfitSet(data);
  }
  if (get(wardrobe) != null && data != null)
    wardrobe.update((w) => {
      w.studio = data;
      if (data.id != null) {
        if (data.type == PACKAGE_TYPE.OUTFIT_SET) {
          const index = w.sets.findIndex(
            (x) => x.id == data.id
          );
          if (index != -1) w.sets[index] = data;
        } else {
          const index = w.outfits.findIndex(
            (x) => x.id == data.id
          );
          if (index != -1) w.outfits[index] = data;
        }
      }
      return w;
    });
});

currentUser.subscribe(async (user) => {
  if (user) {
    //settings up account
    itemPackage.set(new OutfitPackage("default", "alex", [], PACKAGE_TYPE.OUTFIT, null));
    let w = await GetWardrobe();
    if (w == null) {
      w = new WardrobePackage("default_wardrobe", [], [], null);
      await SetWardrobe(w);
    }
    wardrobe.set(w);
    if (w.studio != null) itemPackage.set(w.studio);
  }
});
wardrobe.subscribe(async (data) => {
  await SetWardrobe(data);
});
