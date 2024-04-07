import { outfitsInstance } from "$src/api/outfits";
import { setsIntance } from "$src/api/sets";
import { PACKAGE_TYPE } from "$src/data/consts";

export const getPackageInstanceForType = function (type: string) {
  if (type == PACKAGE_TYPE.OUTFIT || type == PACKAGE_TYPE.OUTFIT_LINK)
    return outfitsInstance;
  if (type == PACKAGE_TYPE.OUTFIT_SET || type == PACKAGE_TYPE.OUTFIT_SET_LINK)
    return setsIntance;
};
