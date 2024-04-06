import { COLOR_TYPE, MODEL_TYPE, OUTFIT_TYPE } from "$data/consts";
import type { OutfitLayer, OutfitPackage } from "$src/data/common";
import HatIcon from "$icons/clothes/hat.svg?raw";
import TopIcon from "$icons/clothes/top.svg?raw";
import BottomIcon from "$icons/clothes/bottom.svg?raw";
import ShoesIcon from "$icons/clothes/shoes.svg?raw";
import HoodieIcon from "$icons/clothes/hoodie.svg?raw";
import { ConvertColor, GetColorFromFileData } from "./colorHelper";
import { normalizeStringCase } from "../data/dataHelper";
import { MergeLayersToImage } from "$src/data/imageMerger";

export const GetOutfitType = function (imageContext: any) {
  const hatArea =
    GetPixelCountInArea(imageContext, 0, 0, 32, 16) +
    GetPixelCountInArea(imageContext, 32, 0, 32, 16);

  const bodyArea =
    GetPixelCountInArea(imageContext, 16, 16, 24, 16) +
    GetPixelCountInArea(imageContext, 16, 32, 24, 16);

  const legsArea =
    GetPixelCountInArea(imageContext, 0, 16, 16, 16) +
    GetPixelCountInArea(imageContext, 16, 48, 16, 16) +
    GetPixelCountInArea(imageContext, 0, 48, 16, 16) +
    GetPixelCountInArea(imageContext, 0, 32, 16, 16);

  const shoesArea =
    GetPixelCountInArea(imageContext, 0, 24, 16, 8) +
    GetPixelCountInArea(imageContext, 16, 56, 16, 8) +
    GetPixelCountInArea(imageContext, 0, 56, 16, 8) +
    GetPixelCountInArea(imageContext, 0, 40, 16, 8);

  const hatPercentage = hatArea / 1024;
  const bodyPercentage = bodyArea / 768;
  const legsPercentage = legsArea / 512;
  const shoesPercentage = shoesArea / 256;
  //console.log(hatPercentage, bodyPercentage, legsPercentage, shoesPercentage)
  //hat / hoodie
  if (bodyPercentage > 0.3 && legsPercentage > 0.3 && shoesPercentage > 0.3) {
    return OUTFIT_TYPE.SUIT;
  }
  if (hatPercentage > 0) {
    if (bodyPercentage > 0.3) {
      if (legsPercentage > 0.1) return OUTFIT_TYPE.SUIT;
      else return OUTFIT_TYPE.HOODIE;
    } else {
      if (legsPercentage > 0) return OUTFIT_TYPE.SUIT;
      else return OUTFIT_TYPE.HAT;
    }
  }
  //body
  if (bodyPercentage > 0.3) {
    if (legsPercentage > 0.1) return OUTFIT_TYPE.SUIT;
    return OUTFIT_TYPE.TOP;
  }
  //shoes / bottom
  if (shoesPercentage > 0.2) {
    if (legsPercentage > 0.5) {
      return OUTFIT_TYPE.BOTTOM;
    } else {
      return OUTFIT_TYPE.SHOES;
    }
  }
  return OUTFIT_TYPE.DEFAULT;
};
export const GetPixelCountInArea = function (
  imageContext: any,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const imageData = imageContext.getImageData(x, y, width, height, {
    willReadFrequently: true,
  });
  let nonTransparentPixelsCount = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    const alpha = imageData.data[i + 3];
    if (alpha !== 0) {
      nonTransparentPixelsCount++;
    }
  }

  return nonTransparentPixelsCount;
};
export const GetContextFromBase64 = async function (base64) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(ctx);
    };
    img.onerror = reject;
    img.src = base64;
  });
};
export const GetCategoriesFromList = function (list: OutfitPackage[]) {
  let categories = Object.keys(OUTFIT_TYPE).filter(
    (x) => OUTFIT_TYPE[x] != OUTFIT_TYPE.OUTFIT_SET
  );
  let categoryCount = {};
  categories.forEach((categoryName) => {
    const category = normalizeStringCase(categoryName);
    categoryCount[category] = list.filter((outfit) => {
      if (outfit.layers?.length == 0) return false;
      if (outfit.type == OUTFIT_TYPE.OUTFIT_SET) return false;
      if (outfit.layers == null || outfit.layers[0] == null) return false;
      return outfit.outfitType == OUTFIT_TYPE[categoryName];
    }).length;
  });
  return categoryCount;
};
export const GetOutfitIconFromType = function (type: string) {
  switch (type.toLowerCase()) {
    case OUTFIT_TYPE.HAT:
      return HatIcon;
    case OUTFIT_TYPE.TOP:
      return TopIcon;
    case OUTFIT_TYPE.HOODIE:
      return HoodieIcon;
    case OUTFIT_TYPE.SHOES:
      return ShoesIcon;
    case OUTFIT_TYPE.BOTTOM:
      return BottomIcon;
    default:
      return TopIcon;
  }
};

export const sortOutfitLayersByColor = async function (
  layers: OutfitLayer[],
  modelType
) {
  let hues = [];
  for (let i = 0; i < layers.length; i++) {
    let color = ConvertColor(
      await GetColorFromFileData(layers[i][modelType]),
      COLOR_TYPE.RGB,
      COLOR_TYPE.HSL
    ) as any;
    hues.push({ h: color.h, item: layers[i] });
  }
  return hues.sort((a, b) => a.h - b.h).map((x) => x.item);
};
export const GetFaceOfRemoteSkin = async function (skinUrl) {
  //fetch skin
  let blob;
  try {
    const response = await fetch(skinUrl);
    blob = await response.blob();
  } catch (e) {
    console.log(e);
    return null;
  }

  // Create an image bitmap from the Blob
  const bitmap = await createImageBitmap(blob);

  // Create a canvas and draw the image bitmap on it
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  context.drawImage(bitmap, 0, 0);

  const scale = 10;
  const face = context.getImageData(8, 8, 8, 8);
  const faceCanvas = document.createElement("canvas");
  faceCanvas.width = face.width * scale;
  faceCanvas.height = face.height * scale;
  const faceContext = faceCanvas.getContext("2d");
  faceContext.imageSmoothingEnabled = false; // Keep the image sharp when scaling
  faceContext.drawImage(
    canvas,
    8,
    8,
    8,
    8,
    0,
    0,
    faceCanvas.width,
    faceCanvas.height
  );
  const faceUrl = faceCanvas.toDataURL();

  return faceUrl;
};
export const MergePackageLayers = async function (
  layers: OutfitLayer[],
  model = MODEL_TYPE.STEVE
) {
  let merged = await MergeLayersToImage(layers, model);
  return merged;
};
