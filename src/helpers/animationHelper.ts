import NewOutfitBottomAnimation from "$src/animation/bottom";
import DefaultAnimation from "$src/animation/default";
import type { RenderAnimation } from "$src/data/animation";
import type { OutfitPackage } from "$src/data/common";
import { CHANGE_TYPE } from "$src/data/consts";
import { GetAnimationForType } from "./imageDataHelpers";

export const GetAnimationForPackageChange = function (
  itempackage: OutfitPackage,
  type: string,
  index: number
): RenderAnimation[] {
  if (type == CHANGE_TYPE.MODEL_TYPE_CHANGE) {
    return [];
  }
  if (type == CHANGE_TYPE.LAYER_ADD) {
    return [
      GetAnimationForType(itempackage.layers[index][itempackage.model].type),
      DefaultAnimation,
    ];
  }
  if(type == CHANGE_TYPE.LAYER_DOWN){
    return [
      GetAnimationForType(itempackage.layers[index][itempackage.model].type),
      DefaultAnimation,
    ];
  }
  if(type == CHANGE_TYPE.LAYER_UP){
    return [
      GetAnimationForType(itempackage.layers[index][itempackage.model].type),
      DefaultAnimation,
    ];
  }
  if(type == CHANGE_TYPE.LAYER_REMOVE){
    return [
      GetAnimationForType(itempackage.layers[index][itempackage.model].type),
      DefaultAnimation,
    ];
  }
  return [];
};
