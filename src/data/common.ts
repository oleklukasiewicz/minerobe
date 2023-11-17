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
  constructor(name: string, steve: FileData, alex: FileData, id: string = "") {
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
  layers: OutfitLayer[];
  metdata: OutfitPackageMetadata;
  id: string;
  constructor(
    name: string,
    model: string,
    layers: OutfitLayer[],
    id: string = "",
    metadata: OutfitPackageMetadata = new OutfitPackageMetadata()
  ) {
    this.name = name;
    this.model = model;
    this.layers = layers;
    this.metdata = metadata;
    this.id = id;
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
};

export const MODEL_TYPE = {
  ALEX: "alex",
  STEVE: "steve",
};

export class OutfitPackageMetadata {
  publisher: OutfitPublisher;
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
