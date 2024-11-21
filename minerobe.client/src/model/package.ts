import { PACKAGE_TYPE } from "$src/data/consts";
import type { MODEL_TYPE } from "$src/data/consts/model";
import type { MinerobeUserSimple } from "./user";

export class OutfitPackage {
  name: string;
  model: MODEL_TYPE;
  type: string;
  layers: OutfitLayer[];
  publisher: MinerobeUserSimple;
  publisherId: string;
  description: string;
  id: string;
  social: PackageSocialData;
  outfitType: string;
  local: any;
  createdAt: Date;
  modifiedAt: Date;
  isInWardrobe: boolean;
  totalLayersCount: number;
  presentationConfig: OutfitPackagePresentationConfigModel;
  constructor(
    name: string,
    model: MODEL_TYPE,
    layers: OutfitLayer[],
    type: string = PACKAGE_TYPE.OUTFIT
  ) {
    this.name = name;
    this.model = model;
    this.layers = layers;
    this.type = type;
    this.createdAt = new Date();
  }
}
export class OutfitPackagePresentationConfigModel {
  public isMerged;
  public isSnapshot;
}

//layers and files
export class FileData {
  fileName: string;
  content: string;
  contentSnapshot: string;
  constructor(fileName: string, content: string) {
    this.fileName = fileName;
    this.content = content;
  }
}
export class OutfitLayer {
  name: string;
  steve: FileData;
  alex: FileData;
  id: string;
  sourcePackageId: string;
  type: string;
  colorName: string;
  outfitType: string;
  isSnapshot: boolean;
  isLoaded: boolean;
  constructor(
    name: string = "",
    steve: FileData = null,
    alex: FileData = null,
    id: string = null
  ) {
    this.name = name;
    this.id = id;
    if (!steve && alex) {
      this.steve = alex;
      this.alex = alex;
    } else if (!alex && steve) {
      this.steve = steve;
      this.alex = steve;
    } else {
      this.steve = steve;
      this.alex = alex;
    }
  }
}
export class PackageSocialData {
  id: string;
  likes: number;
  isShared: boolean;
  isFeatured: boolean;
  downloads: number;
  constructor(
    likes: number = 1,
    isFeatured: boolean = false,
    downloads: number = 0
  ) {
    this.likes = likes;
    this.isFeatured = isFeatured;
    this.downloads = downloads;
  }
}
