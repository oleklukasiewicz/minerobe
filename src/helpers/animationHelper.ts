import NewOutfitBottomAnimation from "$src/animation/bottom";
import DefaultAnimation from "$src/animation/default";
import type { RenderAnimation } from "$src/data/animation";
import type { OutfitPackage } from "$src/data/common";
import { GetAnimationForType } from "./imageDataHelpers";

export const GetAnimationForPackageChange = function (
  oldPackage: OutfitPackage,
  newPackage: OutfitPackage
): RenderAnimation[] {
  let anims = [];
  anims.push(DefaultAnimation);
  if (oldPackage.model !== newPackage.model) {
    anims.unshift(NewOutfitBottomAnimation);
    return anims;
  }
  if (oldPackage.layers.length >= newPackage.layers.length) {
    oldPackage.layers.forEach((oldLayer, index) => {
      const newLayer = newPackage.layers[index];
      if (oldLayer?.variantId !== newLayer?.variantId) {
        anims.unshift(GetAnimationForType(newLayer.type));
        return anims;
      }
    });
  }
  if (oldPackage.layers.length < newPackage.layers.length) {
    newPackage.layers.forEach((newLayer, index) => {
      const oldLayer = oldPackage.layers[index];
      if (oldLayer?.variantId !== newLayer?.variantId) {
        anims.unshift(GetAnimationForType(newLayer.type));
        return anims;
      }
    });
  }

  return [];
};
