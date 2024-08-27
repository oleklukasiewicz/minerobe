import type { OutfitPackageCollection } from "./collection";
import type { OutfitPackage } from "./package";

export class WardrobePackage {
  id: string;
  outfits: OutfitPackage[];
  collections: OutfitPackageCollection[];
  local: any;
  constructor(
    id: string,
    outfits: OutfitPackage[],
    collections: OutfitPackageCollection[] = []
  ) {
    this.id = id;
    this.outfits = outfits;
    this.collections = collections;
  }
}
