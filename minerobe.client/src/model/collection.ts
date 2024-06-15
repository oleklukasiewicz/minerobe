import type { OutfitPackage, PackageSocialData } from "./package";
import type { MinerobeUser } from "./user";

export class OutfitPackageCollection {
  id: string;
  name: string;
  itemsCount: number;
  items: OutfitPackage[];
  displayData: string;
  publisherId: string;
  publisher: MinerobeUser;
  isShared: boolean;
  social: PackageSocialData;
  description: string;
  createdAt: Date;
  modifiedAt: Date;
  type: string;
}
export class OutfitPackageCollectionWithPackageContext {
  id: string;
  name: string;
  itemsCount: number;
  publisherId: string;
  publisher: MinerobeUser;
  isShared: boolean;
  social: PackageSocialData;
  description: string;
  createdAt: Date;
  modifiedAt: Date;
  type: string;
  isInCollection: boolean;
}
