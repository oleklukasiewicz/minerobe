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
    ) as any;
    return wardrobe;
  });
  goto(`/design`);
};
export const navigateToWardrobe = function (page: string = "all",params?: string) {
  goto(`/wardrobe/${page}/${params || ""}`);
};
export const navigateToOutfitPackage = function (
  packag: OutfitPackage,
  variantId?: string
) {
  const varaint = variantId ? variantId : packag.layers[0].id;
  goto(
    `/design/${packag.id}/${varaint || ""}`
  );
};
export const navigate = function (path: string) {
  goto(path);
};
export const navigateToProfile = function () {
  goto(`/profile`);
};
export const navigateToHome = function () {
  goto(`/`);
};
export const navigateToCollection = function (id?: string) {
  goto(`/collection/${id || ""}`);
};
