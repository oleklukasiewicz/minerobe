import { OUTFIT_TYPE } from "$data/consts";
import type { OutfitPackage } from "$src/data/common";
import HatIcon from "$icons/clothes/hat.svg?raw";
import TopIcon from "$icons/clothes/top.svg?raw";
import BottomIcon from "$icons/clothes/bottom.svg?raw";
import ShoesIcon from "$icons/clothes/shoes.svg?raw";
import HoodieIcon from "$icons/clothes/hoodie.svg?raw";

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
      return OUTFIT_TYPE.HOODIE;
    } else {
      return OUTFIT_TYPE.HAT;
    }
  }
  //body
  if (bodyPercentage > 0.3) {
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
  categories.forEach((category) => {
    categoryCount[category] = list.filter((outfit) => {
      if (outfit.layers.length == 0) return false;
      if (outfit.layers[0] == null) return false;
      return outfit.layers[0]["steve"].type == OUTFIT_TYPE[category];
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
