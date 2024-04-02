import { MODEL_TYPE } from "$src/data/consts";
import { ModelMap, ModelPart, ModelTextureArea } from "$src/data/model";

export const STEVE_TEXTURE_MAP = new ModelMap(
  MODEL_TYPE.STEVE,
  new ModelPart(
    "head",
    new ModelTextureArea(0, 0, 32, 16),
    new ModelTextureArea(32, 8, 32, 16)
  ),
  new ModelPart(
    "body",
    new ModelTextureArea(16, 16, 24, 16),
    new ModelTextureArea(16, 32, 24, 16)
  ),
  new ModelPart(
    "leftLeg",
    new ModelTextureArea(16, 48, 16, 16),
    new ModelTextureArea(0, 48, 16, 16)
  ),
  new ModelPart(
    "rightLeg",
    new ModelTextureArea(0, 16, 16, 16),
    new ModelTextureArea(0, 32, 16, 16)
  ),
  new ModelPart(
    "leftArm",
    new ModelTextureArea(32, 48, 16, 16),
    new ModelTextureArea(48, 48, 16, 16)
  ),
  new ModelPart(
    "rightArm",
    new ModelTextureArea(40, 16, 16, 16),
    new ModelTextureArea(40, 34, 16, 16)
  )
);
export const ALEX_TEXTURE_MAP = new ModelMap(
  MODEL_TYPE.ALEX,
  STEVE_TEXTURE_MAP.head,
  STEVE_TEXTURE_MAP.body,
  STEVE_TEXTURE_MAP.leftLeg,
  STEVE_TEXTURE_MAP.rightLeg,
  new ModelPart(
    "leftArm",
    new ModelTextureArea(32, 48, 14, 16),
    new ModelTextureArea(48, 52, 14, 16)
  ),
  new ModelPart(
    "rightArm",
    new ModelTextureArea(40, 16, 14, 16),
    new ModelTextureArea(40, 34, 14, 16)
  )
);
