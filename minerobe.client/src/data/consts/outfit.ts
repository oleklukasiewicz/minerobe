import { get } from "svelte/store";
import { MODEL_TYPE } from "../enums/model";
import { OUTFIT_TYPE, PACKAGE_TYPE } from "../enums/outfit";
import { CURRENT_USER } from "../static";
//package data
export const OUTFIT_TYPE_ARRAY = Object.keys(OUTFIT_TYPE)
  .filter((x) => x !== "OUTFIT_SET")
  .sort()
  .map((key) => {
    return { name: OUTFIT_TYPE[key], normalizedName: key.replace(/_/g, " ") };
  });
export const OUTFIT_TYPE_WITH_SET_ARRAY = Object.keys(OUTFIT_TYPE)
  .sort()
  .map((key) => {
    return { name: OUTFIT_TYPE[key], normalizedName: key.replace(/_/g, " ") };
  });
export const DEFAULT_PACKAGE = {
  name: "Default",
  model: MODEL_TYPE.STEVE,
  type: PACKAGE_TYPE.OUTFIT,
  colorName: null,
  layers: [],
  publisher: {
    id: "",
    name: "dummy",
  },
  publisherId: get(CURRENT_USER)?.id,
  description: "Default outfit",
  outfitType: OUTFIT_TYPE.DEFAULT,
  social: null,
  id: null,
  createdAt: new Date(),
  modifiedAt: new Date(),
  isInWardrobe: false,
  isInCollection: false,
  totalLayersCount: 0,
};
