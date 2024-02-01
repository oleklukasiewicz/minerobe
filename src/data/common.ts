import { get } from "svelte/store";
import { LAYER_TYPE, MODEL_TYPE, OUTFIT_TYPE, PACKAGE_TYPE } from "./consts";
import { GenerateIdForCollection } from "./firebase";
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
  isShared: boolean;
  social: PackageSocialData;
  outfitType: string;
  local: any;
  createdAt: Date;
  modifiedAt: Date;
  constructor(
    name: string,
    model: string,
    layers: OutfitLayer[],
    type: string = PACKAGE_TYPE.OUTFIT,
    publisher: MinerobeUser = get(currentUser),
    id: string = GenerateIdForCollection("dummy"),
    isShared: boolean = false,
    social: PackageSocialData = new PackageSocialData(),
    description: string = "",
    outfitType: string = OUTFIT_TYPE.DEFAULT
  ) {
    this.name = name;
    this.model = model;
    this.layers = layers;
    this.type = type;
    this.publisher = publisher;
    this.id = id;
    this.isShared = isShared;
    this.social = social;
    this.description = description;
    this.outfitType = outfitType;
    this.createdAt = new Date();
  }
}
export class WardrobePackage {
  id: string;
  outfits: OutfitPackage[];
  sets: OutfitPackage[];
  studio: OutfitPackageLink;
  local: any;
  constructor(
    id: string,
    outfits: OutfitPackage[],
    sets: OutfitPackage[] = [],
    studio: OutfitPackageLink = null
  ) {
    this.id = id;
    this.outfits = outfits;
    this.studio = studio;
    this.sets = sets;
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
  variantId: string;
  type: string;
  constructor(
    name: string,
    steve: FileData,
    alex: FileData,
    id: string,
    type: string = LAYER_TYPE.LOCAL,
    variantId: string = null
  ) {
    this.name = name;
    this.variantId = variantId;
    this.id = id;
    this.type = type;
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
  constructor(
    id: string,
    variantId: string = null,
    type: string = LAYER_TYPE.REMOTE
  ) {
    this.id = id;
    this.variantId = variantId;
    this.type = type;
  }
}
export class OutfitPackageLink {
  id: string;
  model: string;
  type: string;
  constructor(
    linkId: string,
    model: string,
    type: string = PACKAGE_TYPE.OUTFIT_SET_LINK
  ) {
    this.id = linkId;
    this.model = model;
    this.type = type;
  }
}

//social
export class PackageSocialData {
  likes: number;
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
  baseTexture: string;
  currentSkin: SkinData;
  linkedMinecraftAccount: any;
  model: string;
  theme: string;
  constructor(
    baseTexture: string,
    theme: string,
    userId: string = get(currentUser).id
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
export class OutfitPackageCollection
{
  id:string;
  name:string;
  outfits:OutfitPackage[];
  displayMode:string;
  publisher:MinerobeUser;
  isShared:boolean;
  social:PackageSocialData;
  description:string;
  createdAt:Date;
  modifiedAt:Date;
  constructor(
    id:string,
    name:string,
    outfits:OutfitPackage[],
    displayMode:string,
    publisher:MinerobeUser,
    isShared:boolean,
    social:PackageSocialData,
    description:string,
    createdAt:Date,
    modifiedAt:Date
  )
  {
    this.id=id;
    this.name=name;
    this.outfits=outfits;
    this.displayMode=displayMode;
    this.publisher=publisher;
    this.isShared=isShared;
    this.social=social;
    this.description=description;
    this.createdAt=createdAt;
    this.modifiedAt=modifiedAt;
  }
}