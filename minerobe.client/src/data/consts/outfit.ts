import { MODEL_TYPE } from "../enums/model";
import { OUTFIT_TYPE, PACKAGE_TYPE } from "../enums/outfit";
//package data
export const OUTFIT_TYPE_ARRAY = Object.keys(OUTFIT_TYPE)
  .filter((x) => x !== "OUTFIT_SET").sort()
  .map((key) => {
    return { name: OUTFIT_TYPE[key], normalizedName: key.replace(/_/g, " ") };
  });
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
};
