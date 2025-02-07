import { goto } from "$app/navigation";
import type { OutfitPackage } from "$data/models/package";

export const navigateToWardrobe = function (
  page: string = "",
  params?: string
) {
  goto(`/wardrobe/${page}`);
};
export const navigateToOutfitPackage = function (
  packag: OutfitPackage,
  variantId?: string
) {
  const varaint = variantId ? variantId : packag.layers[0]?.id;
  goto(`/design/${packag.id}/${varaint || ""}`);
};
export const navigateToOutfitPackageEdit = function (id: string) {
  goto(`/design/${id}/edit`);
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
