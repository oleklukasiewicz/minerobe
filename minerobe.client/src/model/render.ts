import { FileData, OutfitLayer, type OutfitPackage } from "$src/model/package";
import { MergeStringToImage } from "$data/imageMerger";
import type { CapeModel } from "./integration/minecraft";


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
      public model: ModelMap = null,
      public baseTexture: OutfitLayer = null,
      public singleLayer: boolean = false,
      public selectedLayer: OutfitLayer = null,
      public isFlatten: boolean = false,
      public excludedPartsFromFlat: string[] = ["head"],
      public cape: CapeModel = null
    ) {}
    getLayersForModel(ignoreBaseTexture: boolean = false) {
      let result;
      if (this.singleLayer) {
        result =
          this.item?.layers.length > 0 && this.selectedLayer != null
            ? [this.selectedLayer[this.model?.name]]
            : [];
      } else {
        result = this.item?.layers.map((layer) => {
          return layer[this.model?.name];
        });
      }
      if (!ignoreBaseTexture && this.baseTexture) {
        result.unshift(this.baseTexture[this.model?.name]);
      }
      return result;
    }
    async getLayersForRender(ignoreBaseTexture: boolean = false) {
      const layers = this.getLayersForModel(ignoreBaseTexture);
      return await MergeStringToImage(
        layers.map((x) => x.content),
        this
      );
    }
    async setBaseTextureFromString(baseTexture: string) {
      const ll = new OutfitLayer(
        "base",
        new FileData("base_s", baseTexture, null, null),
        new FileData("base_a", baseTexture, null, null),
        null
      );
      this.baseTexture = ll;
    }
    async setBaseTextureFromLayer(baseTexture: OutfitLayer) {
      this.baseTexture = baseTexture;
    }
  }