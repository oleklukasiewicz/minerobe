import { goto } from "$app/navigation";
import type { OutfitPackage } from "$src/model/package";

export const navigateToDesign = function (packag: OutfitPackage) {
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
