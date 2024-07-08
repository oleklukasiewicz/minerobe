import type { OutfitPackage, PackageSocialData } from "./package";

export class MinerobeUserProfile {
  user: MinerobeUser;
  settings: MinerobeUserSettings;
  social: PackageSocialData;
  linkedAccount: any;
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
//settings
export class MinerobeUserSettings {
  id: string;
  ownerId: string;
  currentTexture: CurrentTexture;
  currentTexturePackageId: string;
  baseTexture: OutfitPackage;
  linkedAccount: any;
  theme: string;
}
export class CurrentTexture {
  texture: string;
  model: string;
  isFlat: boolean;
}
export class MinerobeUserSettingsSimple {
  id: string;
  ownerId: string;
  currentTexturePackageId: string;
  baseTexture: OutfitPackage;
  linkedAccount: any;
}
export class CurrentTextureConfig {
  texture: string;
  model: string;
  isFlat: boolean;
  constructor(texture: string, model: string, isFlat: boolean) {
    this.texture = texture;
    this.model = model;
    this.isFlat = isFlat;
  }
}
