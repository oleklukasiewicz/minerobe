import { outfitsInstance } from "$src/api/outfits";
import { setsIntance } from "$src/api/sets";
import { baseTexture, userSettings } from "$src/data/cache";
import type { FileData, OutfitLayer } from "$src/data/common";
import { PACKAGE_TYPE } from "$src/data/consts";
import { MergeStringToImage } from "$src/data/imageMerger";
import { get } from "svelte/store";

export const prepareLayersForRender = function (
  layers: OutfitLayer[],
  selectedLayer: OutfitLayer,
  model: string,
  isSet: boolean
) {
  if (isSet) return layers.map((x) => x[model]);
  return layers.length > 0 && selectedLayer != null
    ? [selectedLayer[model]]
    : [];
};
export const getLayersForRender = async function (
  layers: FileData[],
  isSet: boolean,
  model: string,
  flat: boolean=false
) {
  const exportLayers = [];
  exportLayers.push(...layers.map((x) => x.content));
  if (isSet && get(userSettings).baseTexture != null) {
    exportLayers.push(get(userSettings).baseTexture);
  }
  exportLayers.push(get(baseTexture));
  return await MergeStringToImage(exportLayers, model, flat);
};
export const getPackageInstanceForType = function (type: string) {
  if (type == PACKAGE_TYPE.OUTFIT || type == PACKAGE_TYPE.OUTFIT_LINK)
    return outfitsInstance;
  if (type == PACKAGE_TYPE.OUTFIT_SET || type == PACKAGE_TYPE.OUTFIT_SET_LINK)
    return setsIntance;
};
