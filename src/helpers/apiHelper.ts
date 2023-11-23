import { OutfitLayer, OutfitLayerLink, type OutfitPackage } from "$src/data/common";
import { LAYER_TYPE } from "$src/data/consts";

export const ConvertToFirebasePackage = function (packageData: OutfitPackage) {
  const layers= packageData.layers.map((layer) => {
    if (layer.type == LAYER_TYPE.LOCAL) return layer;
    else {
      return new OutfitLayerLink(layer.id, layer.variantId);
    }
  });
  packageData.layers = layers as OutfitLayer[];
  return packageData;
};
export const ConvertToLocalPackage = async function (packageData: OutfitPackage) {
    const layers= packageData.layers.map((layer) => {
        if (layer.type == LAYER_TYPE.LOCAL) return layer;
        else {
           //get item from firebase
           return layer;
        }});
    packageData.layers = layers as OutfitLayer[];
    return packageData;
};