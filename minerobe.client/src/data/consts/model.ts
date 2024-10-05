import alexModelData from "$src/playerModel/alex.gltf?raw";
import steveModelData from "$src/playerModel/steve.gltf?raw";

export const MODEL_TYPE = {
    ALEX: "alex",
    STEVE: "steve",
  };
export const STEVE_MODEL = {
  name: MODEL_TYPE.STEVE,
  model: "data:model/gltf+json;base64," + btoa(steveModelData),
  head: {
    name: "head",
    textureArea: { x: 0, y: 0, width: 32, height: 16 },
    outerTextureArea: { x: 32, y: 0, width: 32, height: 16 },
  },
  body: {
    name: "body",
    textureArea: { x: 16, y: 16, width: 24, height: 16 },
    outerTextureArea: { x: 16, y: 32, width: 24, height: 16 },
  },
  leftLeg: {
    name: "leftLeg",
    textureArea: { x: 16, y: 48, width: 16, height: 16 },
    outerTextureArea: { x: 0, y: 48, width: 16, height: 16 },
  },
  rightLeg: {
    name: "rightLeg",
    textureArea: { x: 0, y: 16, width: 16, height: 16 },
    outerTextureArea: { x: 0, y: 32, width: 16, height: 16 },
  },
  leftArm: {
    name: "leftArm",
    textureArea: { x: 32, y: 48, width: 16, height: 16 },
    outerTextureArea: { x: 48, y: 48, width: 16, height: 16 },
  },
  rightArm: {
    name: "rightArm",
    textureArea: { x: 40, y: 16, width: 16, height: 16 },
    outerTextureArea: { x: 40, y: 32, width: 16, height: 16 },
  },
};
export const ALEX_MODEL = {
  name: MODEL_TYPE.ALEX,
  model: "data:model/gltf+json;base64," + btoa(alexModelData),
  head: STEVE_MODEL.head,
  body: STEVE_MODEL.body,
  leftLeg: STEVE_MODEL.leftLeg,
  rightLeg: STEVE_MODEL.rightLeg,
  leftArm: {
    name: "leftArm",
    textureArea: { x: 32, y: 48, width: 14, height: 16 },
    outerTextureArea: { x: 48, y: 48, width: 14, height: 16 },
  },
  rightArm: {
    name: "rightArm",
    textureArea: { x: 40, y: 16, width: 14, height: 16 },
    outerTextureArea: { x: 40, y: 32, width: 14, height: 16 },
  },
};
