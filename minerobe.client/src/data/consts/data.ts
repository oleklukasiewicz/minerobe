import { MODEL_TYPE } from "./model";

//package data
export enum LAYER_TYPE {
  LOCAL = "local",
  REMOTE = "remote",
}
export enum OUTFIT_TYPE {
  TOP = "top",
  HOODIE = "hoodie",
  HAT = "hat",
  BOTTOM = "bottom",
  SHOES = "shoes",
  ACCESSORY = "accessory",
  SUIT = "suit",
  DEFAULT = "default",
  OUTFIT_SET = "set",
}
export const OUTFIT_TYPE_ARRAY = Object.keys(OUTFIT_TYPE).map((key) => {
  return { name: OUTFIT_TYPE[key], normalizedName: key.replace(/_/g, " ") };
});

export enum PACKAGE_TYPE {
  OUTFIT = "outfit",
  OUTFIT_SET = "set",
  OUTFIT_COLLECTION = "outfit_collection",
}

//default package
export const DEFAULT_PACKAGE = {
  name: "Default",
  model: MODEL_TYPE.STEVE,
  type: PACKAGE_TYPE.OUTFIT,
  layers: [],
  publisher: {
    id: "dummy",
    name: "dummy",
  },
  publisherId: "dummy",
  description: "Default outfit",
  outfitType: OUTFIT_TYPE.DEFAULT,
  isShared: false,
  social: null,
  id: null,
  createdAt: new Date(),
  modifiedAt: new Date(),
  local: {
    isNew: true,
  },
  isInWardrobe: false,
  totalLayersCount: 0,
  presentationConfig: {
    isMerged: false,
    isSnapshot: false,
  },
};
