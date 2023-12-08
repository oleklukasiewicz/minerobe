import { get } from "svelte/store";
import { APP_STATE, LAYER_TYPE, OUTFIT_TYPE, PACKAGE_TYPE } from "./consts";
import { GenerateIdForCollection } from "./firebase";
import { currentUser } from "./cache";

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
  constructor(id: string, variantId: string) {
    this.id = id;
    this.variantId = variantId;
    this.type = LAYER_TYPE.REMOTE;
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
  id: string;
  isShared: boolean;
  constructor(
    name: string,
    model: string,
    layers: OutfitLayer[],
    type: string = PACKAGE_TYPE.OUTFIT,
    publisher: MinerobeUser = get(currentUser),
    id: string = GenerateIdForCollection("dummy"),
    isShared: boolean = false
  ) {
    this.name = name;
    this.model = model;
    this.layers = layers;
    this.type = type;
    this.publisher = publisher;
    this.id = id;
    this.isShared = isShared;
  }
}
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
export class AppState {
  app: string;
  wardrobe: boolean;
  user: boolean;
  constructor() {
    this.app = APP_STATE.LOADING;
  }
  wardrobeReady = function () {
    if (this.app == APP_STATE.USER_READY) {
      this.wardrobe = true;
      this.app=APP_STATE.READY;
    }
    return this;
  };
  userReady = function () {
    if (this.app == APP_STATE.LOADING) {
      this.user = true;
      this.app= APP_STATE.USER_READY;
    }
    return this;
  }
  userUnready = function () {
    this.user = false;
    this.wardrobe = false;
    this.app = APP_STATE.LOADING;
    return this;
  }
}
