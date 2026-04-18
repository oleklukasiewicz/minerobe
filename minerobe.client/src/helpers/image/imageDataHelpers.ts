import { OUTFIT_TYPE } from "$src/data/enums/outfit";

export const GetOutfitType = function (imageContext: any) {
  const hatArea =
    GetPixelCountInArea(imageContext, 0, 8, 64, 8) +
    GetPixelCountInArea(imageContext, 8, 0, 16, 8) +
    GetPixelCountInArea(imageContext, 40, 0, 16, 8);

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

  if (hatPercentage > 0.01) {
    if (bodyPercentage > 0.3) {
      return legsPercentage > 0.3 ? OUTFIT_TYPE.SUIT : OUTFIT_TYPE.HOODIE;
    }

    return legsPercentage > 0 ? OUTFIT_TYPE.SUIT : OUTFIT_TYPE.HAT;
  }

  //body
  if (bodyPercentage > 0.3) {
    return legsPercentage > 0.3 ? OUTFIT_TYPE.SUIT : OUTFIT_TYPE.TOP;
  }

  //shoes / bottom
  if (shoesPercentage > 0.2) {
    return legsPercentage > 0.5 ? OUTFIT_TYPE.BOTTOM : OUTFIT_TYPE.SHOES;
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
  const data = imageContext.getImageData(x, y, width, height).data;
  let nonTransparentPixelsCount = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] !== 0) nonTransparentPixelsCount++;
  }

  return nonTransparentPixelsCount;
};
export const GetContextFromBase64 = async function (base64): Promise<CanvasRenderingContext2D> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      resolve(ctx);
    };
    img.onerror = reject;
    img.src = base64;
  });
};
export const GetImageArea = function (
  base64Image,
  x,
  y,
  width,
  height
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", {
        willReadFrequently: true,
      });
      if (ctx) {
        ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
        resolve(canvas.toDataURL());
      } else {
        reject(new Error("Failed to get 2D context"));
      }
    };

    img.onerror = reject;
    img.src = base64Image;
  });
};
export const GetImageFaceArea = function (base64Image): Promise<string> {
  return GetImageArea(base64Image, 8, 8, 8, 8);
};
