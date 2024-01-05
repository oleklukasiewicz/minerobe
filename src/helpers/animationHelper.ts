import NewOutfitBottomAnimation from "$src/animation/bottom";
import NewOutfitBottomAltAnimation from "$src/animation/bottomAlt";
import NewOutfitBottomAlt2Animation from "$src/animation/bottomAlt2";
import ClapAnimation from "$src/animation/clap";
import DefaultAnimation from "$src/animation/default";
import HandsUpAnimation from "$src/animation/handsup";
import HatAnimation from "$src/animation/hat";
import WavingAnimation from "$src/animation/waving";
import type { RenderAnimation } from "$src/data/animation";
import type { OutfitPackage } from "$src/data/common";
import { CHANGE_TYPE, OUTFIT_TYPE } from "$src/data/consts";

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
  if (type == CHANGE_TYPE.LAYER_DOWN) {
    return [
      GetAnimationForType(itempackage.layers[index][itempackage.model].type),
      DefaultAnimation,
    ];
  }
  if (type == CHANGE_TYPE.LAYER_UP) {
    return [
      GetAnimationForType(itempackage.layers[index][itempackage.model].type),
      DefaultAnimation,
    ];
  }
  if (type == CHANGE_TYPE.LAYER_REMOVE) {
    return [
      GetAnimationForType(itempackage.layers[index][itempackage.model].type),
      DefaultAnimation,
    ];
  }
  if (type == CHANGE_TYPE.PACKAGE_IMPORT) {
    const random = Math.random();

    if (random < 0.2) {
      return [HandsUpAnimation];
    } else {
      if (random < 0.4) return [WavingAnimation];
      else [ClapAnimation];
    }
    [DefaultAnimation];
  }
  if (type == CHANGE_TYPE.SHARE) {
    return [WavingAnimation,DefaultAnimation];
  }
  if (type == CHANGE_TYPE.DOWNLOAD) {
    return [HandsUpAnimation,DefaultAnimation];
  }
  return [];
};
export const GetAnimationForType = function (type: string) {
  const random = Math.random();
  switch (type) {
    case OUTFIT_TYPE.HAT:
      return HatAnimation;
    case OUTFIT_TYPE.TOP:
    case OUTFIT_TYPE.HOODIE:
      return NewOutfitBottomAnimation;
    case OUTFIT_TYPE.SHOES:
      if (random < 0.5) {
        return NewOutfitBottomAlt2Animation;
      } else {
       return WavingAnimation;
      }
    case OUTFIT_TYPE.BOTTOM:
      if (random < 0.5) {
        return NewOutfitBottomAlt2Animation;
      } else {
       return NewOutfitBottomAltAnimation;
      }
  }
};