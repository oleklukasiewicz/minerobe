import { OutfitLayer, type OutfitPackage } from "$src/model/package";
import type { MODEL_TYPE } from "$src/data/consts/model";

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
    public item: OutfitPackage = null,
    public baseTexture: OutfitLayer | string = null,
    public isFlatten: boolean = false,
    public selectedLayerId: string = null,
    public capeId: string = null,
    public modelName: MODEL_TYPE = null
  ) {}
}
