import { get } from "svelte/store";
import { LAYER_TYPE, OUTFIT_TYPE, PACKAGE_TYPE } from "./consts";
import { GenerateIdForCollection } from "./firebase";
import { currentUser } from "./cache";

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
export class OutfitLayerLink {
  id: string;
  type: string;
  variantId: string;
  constructor(id: string, variantId: string = null, type: string = LAYER_TYPE.REMOTE) {
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
  }
}
export class WardrobePackage {
  id: string;
  outfits: OutfitPackage[];
  sets: OutfitPackage[];
  studio: OutfitPackageLink;
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

export class PackageSocialData {
  likes: number;
  isFeatured: boolean;
  constructor(likes: number = 1, isFeatured: boolean = false) {
    this.likes = likes;
    this.isFeatured = isFeatured;
  }
}
export class LandingPageData {
  createdAt: Date;
  banner: string;
  featured: OutfitLayerLink[];
  mostLiked: OutfitLayerLink[];
  constructor(
    createdAt: Date,
    banner: string,
    featured: OutfitLayerLink[],
    mostLiked: OutfitLayerLink[]
  ) {
    this.createdAt = createdAt;
    this.banner = banner;
    this.featured = featured;
    this.mostLiked = mostLiked;
  }
}
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
}
