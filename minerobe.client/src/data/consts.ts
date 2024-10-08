import alexModelData from "$src/playerModel/alex.gltf?raw";
import steveModelData from "$src/playerModel/steve.gltf?raw";

export const COLORS = {
  WHITE: { r: 255, g: 255, b: 255 },
  CREAM: { r: 255, g: 253, b: 208 },
  NUDE: { r: 255, g: 228, b: 181 },
  PASTEL_PINK: { r: 255, g: 182, b: 193 },
  LAVENDER: { r: 230, g: 230, b: 250 },
  PALE_BLUE: { r: 173, g: 216, b: 230 },
  PALE_TURQUOISE: { r: 175, g: 238, b: 238 },
  PALE_GREEN: { r: 152, g: 251, b: 152 },
  SAND: { r: 244, g: 164, b: 96 },
  LIGHT_GREY: { r: 211, g: 211, b: 211 },
  LIGHT_YELLOW: { r: 255, g: 255, b: 224 },
  YELLOW: { r: 255, g: 255, b: 0 },
  WHEAT: { r: 245, g: 222, b: 179 },
  MUSTARD: { r: 255, g: 219, b: 88 },
  AMBER: { r: 255, g: 191, b: 0 },
  WARM_OLIVE: { r: 128, g: 128, b: 0 },
  LIGHT_ORANGE: { r: 255, g: 215, b: 0 },
  ORANGE: { r: 255, g: 165, b: 0 },
  MANDARINE: { r: 255, g: 130, b: 71 },
  PEACH: { r: 255, g: 218, b: 185 },
  COPPER: { r: 184, g: 115, b: 51 },
  SPICY_RED: { r: 255, g: 69, b: 0 },
  PINK: { r: 255, g: 192, b: 203 },
  CORAL: { r: 255, g: 127, b: 80 },
  RED: { r: 255, g: 0, b: 0 },
  MAUVE: { r: 224, g: 176, b: 255 },
  ROSE: { r: 255, g: 0, b: 127 },
  DUSTY_ROSE: { r: 199, g: 21, b: 133 },
  ORCHID: { r: 218, g: 112, b: 214 },
  HOT_PINK: { r: 255, g: 105, b: 180 },
  FUCHSIA: { r: 255, g: 0, b: 255 },
  PURPLE: { r: 128, g: 0, b: 128 },
  VIOLET: { r: 238, g: 130, b: 238 },
  GRAPE: { r: 106, g: 90, b: 205 },
  DARK_VIOLET: { r: 148, g: 0, b: 211 },
  LIGHT_BLUE: { r: 173, g: 216, b: 230 },
  HIACYNT: { r: 138, g: 43, b: 226 },
  BLUE: { r: 0, g: 0, b: 255 },
  AQUA: { r: 0, g: 255, b: 255 },
  INDIGO: { r: 75, g: 0, b: 130 },
  NAVY: { r: 0, g: 0, b: 128 },
  LIGHT_TURQUISE: { r: 175, g: 238, b: 238 },
  MINT_GREEN: { r: 152, g: 255, b: 152 },
  TURQUISE: { r: 64, g: 224, b: 208 },
  TEAL_GREEN: { r: 0, g: 128, b: 128 },
  DARK_TURQUISE: { r: 0, g: 206, b: 209 },
  LIGHT_GREEN: { r: 144, g: 238, b: 144 },
  YELLOW_GREEN: { r: 154, g: 205, b: 50 },
  FRESH_GREEN: { r: 0, g: 255, b: 0 },
  GREEN: { r: 0, g: 128, b: 0 },
  BROWNISH_GREEN: { r: 85, g: 107, b: 47 },
  DARK_GREEN: { r: 0, g: 100, b: 0 },
  BEIGE: { r: 245, g: 245, b: 220 },
  LIGHT_OLIVE: { r: 170, g: 178, b: 32 },
  GOLDEN_BROWN: { r: 153, g: 101, b: 21 },
  MAROON: { r: 128, g: 0, b: 0 },
  COFFEE: { r: 111, g: 78, b: 55 },
  MID_GREY: { r: 128, g: 128, b: 128 },
  ANTRAQTE: { r: 139, g: 132, b: 109 },
  MILITARY: { r: 85, g: 107, b: 47 },
  BROWN: { r: 150, g: 75, b: 0 },
  DARK_CHOCOLATE: { r: 99, g: 79, b: 66 },
  DARK_GREY: { r: 169, g: 169, b: 169 },
  OLIVE: { r: 128, g: 128, b: 0 },
  CARMINE: { r: 150, g: 0, b: 24 },
  REDISH_PURPLE: { r: 149, g: 53, b: 83 },
  STEEL_VIOLET: { r: 90, g: 79, b: 207 },
  STEEL_BLUE: { r: 70, g: 130, b: 180 },
  STEEL_GREEN: { r: 89, g: 158, b: 84 },
  DUSTY_GREEN: { r: 138, g: 154, b: 91 },
  DUSTY_BROWN: { r: 151, g: 105, b: 79 },
  BLACK: { r: 0, g: 0, b: 0 },
};
export const COLORS_ARRAY = Object.keys(COLORS).map((key) => {
  return { ...COLORS[key], name: key, normalizedName: key.replace(/_/g, " ") };
});
export const LAYER_TYPE = {
  LOCAL: "local",
  REMOTE: "remote",
};
export const OUTFIT_TYPE = {
  TOP: "top",
  HOODIE: "hoodie",
  HAT: "hat",
  BOTTOM: "bottom",
  SHOES: "shoes",
  ACCESSORY: "accessory",
  SUIT: "suit",
  DEFAULT: "default",
  OUTFIT_SET: "set",
};
export const OUTFIT_TYPE_ARRAY = Object.keys(OUTFIT_TYPE).map((key) => {
  return { name: OUTFIT_TYPE[key], normalizedName: key.replace(/_/g, " ") };
});

export const MODEL_TYPE = {
  ALEX: "alex",
  STEVE: "steve",
};
export const PACKAGE_TYPE = {
  OUTFIT: "outfit",
  OUTFIT_SET: "set",
  OUTFIT_SET_LINK: "outfit_set_link",
  OUTFIT_LINK: "outfit_link",
  OUTFIT_COLLECTION: "outfit_collection",
  OUTFIT_COLLECTION_LINK: "outfit_collection_link",
};
export const APP_STATE = {
  LOADING: "loading",
  READY: "ready",
  USER_READY: "user_ready",
  ERROR: "error",
  GUEST_READY: "guest_ready",
};
export const CHANGE_TYPE = {
  LAYER_UP: "layer_up",
  LAYER_DOWN: "layer_down",
  LAYER_REMOVE: "layer_remove",
  LAYER_ADD: "layer_add",
  MODEL_TYPE_CHANGE: "model_type_change",
  PACKAGE_IMPORT: "package_import",
  PACKAGE_EXPORT: "package_export",
  DOWNLOAD: "download",
  SKIN_SET: "skin_set",
  SHARE: "share",
};
export const COLOR_TYPE = {
  RGB: "rgb",
  HEX: "hex",
  HSL: "hsl",
  RGBA: "rgba",
  STRING_COLOR: "string_color",
};
export const COLLECTION_DISPLAY_MODE = {
  GRID: "grid",
  LIST: "list",
};

export const DEFAULT_PACKAGE = {
  name: "Default",
  model: MODEL_TYPE.STEVE,
  type: PACKAGE_TYPE.OUTFIT,
  layers: [],
  publisher: {
    id: "dummy",
    name: "dummy",
  },
  publisherId: "dummy",
  description: "Default outfit",
  outfitType: OUTFIT_TYPE.DEFAULT,
  isShared: false,
  social: null,
  id: null,
  createdAt: new Date(),
  modifiedAt: new Date(),
  local: {
    isNew: true,
  },
  isInWardrobe: false,
  totalLayersCount: 0,
  presentationConfig: {
    isMerged: false,
    isSnapshot: false,
  },
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
