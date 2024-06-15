import type { OutfitPackage, PackageSocialData } from "./package";

export class MinerobeUserProfile {
    user: MinerobeUser;
    settings: MinerobeUserSettings;
    social: PackageSocialData;
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
  //settings
  export class MinerobeUserSettings {
    id: string;
    ownerId: string;
    currentTexture: OutfitPackage;
    currentTexturePackageId: string;
    baseTexture: OutfitPackage;
    linkedAccount: any;
    theme: string;
  }
  export class MinerobeUserSettingsSimple {
    id: string;
    ownerId: string;
    currentTexturePackageId: string;
    baseTexture: OutfitPackage;
    linkedAccount: any;
  }