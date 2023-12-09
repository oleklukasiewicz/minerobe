import type { OutfitPackage } from "$src/data/common";
import { goto } from "$app/navigation";
import { itemPackage } from "$src/data/cache";

export const navigateToDesign = function (packag: OutfitPackage) {
  itemPackage.set(packag);
  goto(`/design`);
};
export const navigateToWardrobe = function () {
  goto(`/wardrobe`);
}