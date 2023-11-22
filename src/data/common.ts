import { GenerateIdForCollection } from "./firebase";

export class FileData {
  fileName: string;
  content: string;
  type: string;
  constructor(
    fileName: string,
    content: string,
    type: string = OUTFIT_TYPE.DEFAULT
  ) {
    this.fileName = fileName;
    this.content = content;
    this.type = type;
  }
}
export class OutfitLayer {
  name: string;
  steve: FileData;
  alex: FileData;
  id: string;
  constructor(
    name: string,
    steve: FileData,
    alex: FileData,
    id: string = GenerateIdForCollection("dummy")
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
  isChanged(other: OutfitLayer) {
    if (this.name !== other.name) {
      return true;
    }
    if (
      !(this.steve.content == other.steve.content) ||
      !(this.alex.content == other.alex.content)
    ) {
      return true;
    }

    return false;
  }
}

export class OutfitPackage {
  name: string;
  model: string;
  type: string;
  layers: OutfitLayer[];
  metadata: OutfitPackageMetadata;
  id: string;
  constructor(
    name: string,
    model: string,
    layers: OutfitLayer[],
    id: string = "",
    metadata: OutfitPackageMetadata = new OutfitPackageMetadata(),
    type: string = PACKAGE_TYPE.OUTFIT
  ) {
    this.name = name;
    this.model = model;
    this.layers = layers;
    this.metadata = metadata;
    this.id = id;
    this.type = type;
  }
}
export const OUTFIT_TYPE = {
  TOP: "top",
  HOODIE: "hoodie",
  HAT: "hat",
  BOTTOM: "bottom",
  SHOES: "shoes",
  ACCESSORY: "accessory",
  SUIT: "suit",
  DEFAULT: "default",
  OUTFIT_SET: "outfit_set",
};

export const MODEL_TYPE = {
  ALEX: "alex",
  STEVE: "steve",
};
export const PACKAGE_TYPE = {
  OUTFIT: "outfit",
  OUTFIT_SET: "outfit_set",
};
export class OutfitPackageMetadata {
  publisher: OutfitPublisher;
  wardrobeItemId: string;
  publisherId: string;
  constructor(
    publisher: OutfitPublisher = null,
    wardrobeItemId: string=null,
    publisherId: string = null
  ) {
    this.publisher = publisher;
    this.wardrobeItemId = wardrobeItemId;
    this.publisherId = publisherId;
  }
}
export class OutfitLayerMetadata {}
export class OutfitPublisher {
  name: string;
  id: string;
  avatar: string;
  constructor(id: string, name: string, avatar: string) {
    this.name = name;
    this.id = id;
    this.avatar = avatar;
  }
}
export class WardrobePackage {
  id: string;
  outfits: OutfitPackage[];
  sets: OutfitPackage[];
  studio: OutfitPackage;
  constructor(
    id: string,
    outfits: OutfitPackage[],
    sets: OutfitPackage[] = [],
    studio: OutfitPackage = null
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
