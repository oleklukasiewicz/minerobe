import { goto, invalidateAll, replaceState } from "$app/navigation";
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
  const normalizedQuery = query.trim();
  const target = normalizedQuery
    ? `/explore?q=${encodeURIComponent(normalizedQuery)}`
    : `/explore`;
    
  goto(target, {
    replaceState: true,
    noScroll: true,
    keepFocus: true,
  });
};
