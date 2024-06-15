import type { OutfitPackageCollection } from "./collection";
import type { OutfitPackage } from "./package";

export class WardrobePackage {
  id: string;
  outfits: OutfitPackage[];
  collections: OutfitPackageCollection[];
  studio: OutfitPackage;
  local: any;
  constructor(
    id: string,
    outfits: OutfitPackage[],
    studio: OutfitPackage = null,
    collections: OutfitPackageCollection[] = []
  ) {
    this.id = id;
    this.outfits = outfits;
    this.studio = studio;
    this.collections = collections;
  }
}
