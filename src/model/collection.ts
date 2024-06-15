import { PACKAGE_TYPE } from "$src/data/consts";
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
export class OutfitPackageCollectionLink {
  id: string;
  type: string;
  constructor(id: string, type: string = PACKAGE_TYPE.OUTFIT_COLLECTION_LINK) {
    this.id = id;
    this.type = type;
  }
}
