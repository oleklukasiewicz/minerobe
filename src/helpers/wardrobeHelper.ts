import { GenerateIdForWardrobeItem } from "$src/api/wardrobe";
import { currentUser, wardrobe } from "$src/data/cache";
import { OutfitPackageMetadata, type OutfitPackage, WardrobePackage } from "$src/data/common";
import { get } from "svelte/store";

export const AddToWardrobe = async function (wardrobeItem: OutfitPackage) {
  if (get(currentUser)) {
    const wardrobePackage: WardrobePackage = get(wardrobe);
    console.log(wardrobePackage);
    console.log(
      wardrobePackage.outfits.find(
        (outfit: OutfitPackage) =>
          outfit.metadata?.wardrobeItemId ==
          wardrobeItem.metadata?.wardrobeItemId
      )
    );
    if (
      wardrobePackage.outfits.find(
        (outfit: OutfitPackage) =>
          outfit.metadata?.wardrobeItemId ==
          wardrobeItem.metadata?.wardrobeItemId
      )
    )
      return;

    if (!wardrobeItem.metadata)
      wardrobeItem.metadata = new OutfitPackageMetadata();
    wardrobeItem.metadata.wardrobeItemId = GenerateIdForWardrobeItem();

    wardrobePackage.outfits.push(wardrobeItem);
    wardrobe.set(wardrobePackage);
  }
};
