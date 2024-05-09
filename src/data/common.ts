import { get } from "svelte/store";
import {
  DATA_PATH_CONFIG,
  LAYER_TYPE,
  MODEL_TYPE,
  OUTFIT_TYPE,
  PACKAGE_TYPE,
} from "./consts";
import { currentUser } from "./cache";

//base
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
  snapshotConfig: OutfitPackageSnapshotConfig;
  constructor(
    name: string,
    model: string,
    layers: OutfitLayer[],
    type: string = PACKAGE_TYPE.OUTFIT,
    publisher: MinerobeUser = get(currentUser),
    id: string = null,
    isShared: boolean = false,
    social: PackageSocialData = new PackageSocialData(),
    description: string = "",
    outfitType: string = OUTFIT_TYPE.DEFAULT,
    snapshotConfig: OutfitPackageSnapshotConfig = new OutfitPackageSnapshotConfig()
  ) {
    this.name = name;
    this.model = model;
    this.layers = layers;
    this.type = type;
    this.publisher = publisher;
    this.id = id;
    this.social = social;
    this.description = description;
    this.outfitType = outfitType;
    this.createdAt = new Date();
    this.snapshotConfig = snapshotConfig;
  }
}
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

//layers and files
export class FileData {
  fileName: string;
  content: string;
  type: string;
  color: string;
  constructor(
    fileName: string,
    content: string,
    type: string = OUTFIT_TYPE.DEFAULT,
    color: string = null
  ) {
    this.fileName = fileName;
    this.content = content;
    this.type = type;
    this.color = color;
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
    id: string = null,
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
//links
export class OutfitLayerLink {
  id: string;
  type: string;
  variantId: string;
  path: string;
  constructor(
    id: string,
    variantId: string = null,
    type: string = LAYER_TYPE.REMOTE
  ) {
    this.id = id;
    this.variantId = variantId;
    this.type = type;
    this.path = DATA_PATH_CONFIG.OUTFIT;
  }
}
export class OutfitPackageLink {
  id: string;
  model: string;
  variantId: string;
  type: string;
  constructor(
    linkId: string,
    model: string,
    type: string = PACKAGE_TYPE.OUTFIT_SET_LINK,
    variantId: string = null
  ) {
    this.id = linkId;
    this.model = model;
    this.type = type;
    this.variantId = variantId;
  }
}

//social
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
//view
export class LandingPageData {
  createdAt: Date;
  banner: string;
  featured: OutfitPackageLink[];
  mostLiked: OutfitPackageLink[];
  mostDownloaded: OutfitPackageLink[];
  mostRecent: OutfitPackageLink[];
  constructor(
    createdAt: Date,
    banner: string,
    featured: OutfitPackageLink[],
    mostLiked: OutfitPackageLink[],
    mostDownloaded: OutfitPackageLink[],
    mostRecent: OutfitPackageLink[]
  ) {
    this.createdAt = createdAt;
    this.banner = banner;
    this.featured = featured;
    this.mostLiked = mostLiked;
    this.mostDownloaded = mostDownloaded;
    this.mostRecent = mostRecent;
  }
}
//query
export class OutfitPackageQueryData {
  id: string;
  variantId: string;
  color: string;
  normalizedColor: string;
  description: string;
  type: string;
  outfitType: string;
  variantCount: number;
  likes: number;
  isFeatured: boolean;
  name: string;
  isShared: boolean;
  model: string;
  publisherId: string;
  downloads: number;
  createdAt: Date;
  modifiedAt: Date;
}

//user
export class MinerobeUser {
  id: string;
  name: string;
  avatar: string;
  constructor(id: string, name: string, avatar: string) {
    this.id = id;
    this.name = name;
    this.avatar = avatar;
  }
}
export class MinerobeUserLink {
  id: string;
  userId: string;
  constructor(id: string, userId: string) {
    this.id = id;
    this.userId = userId;
  }
}
//settings
export class MinerobeUserSettings {
  userId: string;
  baseTexture: OutfitLayer;
  currentSkin: SkinData;
  linkedMinecraftAccount: any;
  model: string;
  theme: string;
  constructor(
    baseTexture: OutfitLayer,
    theme: string,
    userId: string = get(currentUser)?.id
  ) {
    this.baseTexture = baseTexture;
    this.theme = theme;
    this.userId = userId;
    this.model = MODEL_TYPE.STEVE;
  }
}
export class SkinData {
  id: string;
  model: string;
  texture: string;
  constructor(id: string, model: string, texture: string) {
    this.id = id;
    this.model = model;
    this.texture = texture;
  }
}
export class OutfitPackageCollection {
  id: string;
  name: string;
  outfits: OutfitPackage[];
  displayMode: string;
  publisher: MinerobeUser;
  isShared: boolean;
  social: PackageSocialData;
  description: string;
  createdAt: Date;
  modifiedAt: Date;
  type: string;
  constructor(
    id: string,
    name: string,
    outfits: OutfitPackage[],
    displayMode: string,
    publisher: MinerobeUser,
    isShared: boolean,
    social: PackageSocialData,
    description: string,
    createdAt: Date,
    modifiedAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.outfits = outfits;
    this.displayMode = displayMode;
    this.publisher = publisher;
    this.isShared = isShared;
    this.social = social;
    this.description = description;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt;
    this.type = PACKAGE_TYPE.OUTFIT_COLLECTION;
  }
}
export class OutfitPackageCollectionLink {
  id: string;
  type: string;
  constructor(id: string, type: string = PACKAGE_TYPE.OUTFIT_COLLECTION_LINK) {
    this.id = id;
    this.type = type;
  }
}

export class OutfitPackageSnapshotPackage {
  snapshot: OutfitLayer[];
  isMerged: boolean;
}
export class OutfitPackageSnapshotConfig {
  isMerged: boolean;
}
