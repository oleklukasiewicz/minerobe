import { DEFAULT_PACKAGE } from "$src/data/consts/outfit";
import { OutfitLayer, type OutfitPackage } from "$data/models/package";
import type { MODEL_TYPE } from "../enums/model";
import type { PACKAGE_TYPE } from "../enums/outfit";

export class ModelTextureArea {
  public constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}
}
export class ModelPart {
  public constructor(
    public name: string,
    public textureArea: ModelTextureArea,
    public outerTextureArea: ModelTextureArea
  ) {}
}
export class ModelMap {
  public constructor(
    public name: string,
    public model: string,
    public head: ModelPart,
    public body: ModelPart,
    public leftLeg: ModelPart,
    public rightLeg: ModelPart,
    public leftArm: ModelPart,
    public rightArm: ModelPart
  ) {}
}
export class OutfitPackageRenderConfig {
  public constructor(
    public item: OutfitPackage = DEFAULT_PACKAGE,
    public baseTexture: OutfitLayer | string = null,
    public isFlatten: boolean = false,
    public excludedPartsFromFlat: string[] = ["head"],
    public selectedLayerId: string = null,
    public capeId: string = null,
    public capeTexture: string = null
  ) {}
  ToExportConfig(): OutfitPackageExportConfig {
    const config = new OutfitPackageExportConfig();
    config.packageId = this.item.id;
    config.type = this.item.type;
    config.isFlatten = this.isFlatten;
    config.capeId = this.capeId;
    config.model = this.item.model;
    return config;
  }
}
export class OutfitPackageExportConfig {
  public packageId: string;
  public type: PACKAGE_TYPE;
  public isFlatten: boolean;
  public capeId: string;
  public model: MODEL_TYPE;
}
