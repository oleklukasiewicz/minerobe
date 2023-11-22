import { GenerateIdForWardrobeItem } from "$src/api/wardrobe";
import { currentUser, wardrobe } from "$src/data/cache";
import { OutfitPackageMetadata, type OutfitPackage, WardrobePackage, OutfitPublisher } from "$src/data/common";
import { get } from "svelte/store";

export const AddToWardrobe = async function (wardrobeItem: OutfitPackage) {
  if (get(currentUser)) {
    const wardrobePackage: WardrobePackage = get(wardrobe);
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
    wardrobeItem.metadata.publisherId = get(currentUser).id;
    wardrobePackage.outfits.push(wardrobeItem);
    wardrobe.set(wardrobePackage);
  }
};
export const RemoveFromWardrobe = async function (wardrobeItemId: string) {
  if (get(currentUser)) {
    const wardrobePackage: WardrobePackage = get(wardrobe);
    wardrobePackage.outfits = wardrobePackage.outfits.filter(
      (outfit: OutfitPackage) =>
        outfit.metadata?.wardrobeItemId != wardrobeItemId
    );
    wardrobe.set(wardrobePackage);
  }
}
