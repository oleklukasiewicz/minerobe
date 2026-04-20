import { goto } from "$app/navigation";
import type { OutfitPackage } from "$data/models/package";

export const navigateToWardrobe = function (
  page: string = ""
) {
  goto(`/wardrobe/${page}`);
};
export const navigateToOutfitPackage = function (
  packag: OutfitPackage,
  variantId?: string,
  edit: boolean = false
) {
  if (edit) {
    goto(`/design/${packag.id}/edit`);
    return;
  }
  const varaint = variantId ? variantId : packag.layers[0]?.id;
  goto(`/design/${packag.id}/${varaint || ""}`);
};
export const navigateToHome = function () {
  goto(`/`);
};
export const navigateToCollection = function (
  id?: string,
  edit: boolean = false
) {
  if (edit) {
    goto(`/collection/${id}/edit`);
    return;
  }
  goto(`/collection/${id}`);
};
export const navigateToExplore = function (query: string) {
  goto(`/explore?q=${encodeURIComponent(query)}`);
}
