import { OutfitPackageLink, type OutfitPackage } from "$src/data/common";
import { goto } from "$app/navigation";
import { wardrobe } from "$src/data/cache";
import { PACKAGE_TYPE } from "$src/data/consts";

export const navigateToDesign = function (packag: OutfitPackage) {
  wardrobe.update((wardrobe) => {
    wardrobe.studio = new OutfitPackageLink(
      packag.id,
      packag.model,
      packag.type == PACKAGE_TYPE.OUTFIT_SET
        ? PACKAGE_TYPE.OUTFIT_SET_LINK
        : PACKAGE_TYPE.OUTFIT_LINK
    );
    return wardrobe;
  });
  goto(`/design`);
};
export const navigateToWardrobe = function () {
  goto(`/wardrobe`);
};
export const navigate = function (path: string) {
  goto(path);
};
