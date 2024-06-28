import { OUTFIT_TYPE, PACKAGE_TYPE } from "$src/data/consts";
import type { MinerobeUser } from "./user";

export class OutfitPackage {
  name: string;
  model: string;
  type: string;
  layers: OutfitLayer[];
  publisher: MinerobeUser;
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
    model: string,
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
  type: string;
  color: string;
  colorName: string;
  constructor(
    fileName: string,
    content: string,
    type: string = OUTFIT_TYPE.DEFAULT,
    color: string = null,
    colorName: string = null
  ) {
    this.fileName = fileName;
    this.content = content;
    this.type = type;
    this.color = color;
    this.colorName = colorName;
  }
}
export class OutfitLayer {
  name: string;
  steve: FileData;
  alex: FileData;
  id: string;
  sourcePackageId: string;
  type: string;
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
