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
  constructor(name: string, steve: FileData, alex: FileData) {
    this.name = name;
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
}

export class OutfitPackage
{
  name: string;
  model: string;
  layers: OutfitLayer[];
  constructor(name: string,model:string, layers: OutfitLayer[]){
    this.name = name;
    this.model = model;
    this.layers = layers;
  }
}
export const OUTFIT_TYPE = {
  TOP: "top",
  HOODIE: "hoodie",
  HAT: "hat",
  BOTTOM: "bottom",
  SHOES: "shoes",
  ACCESSORY: "accessory",
  SUIT : "suit",
  DEFAULT: "default",
};

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

  //hat / hoodie
  if(hatPercentage > 0.3 && bodyPercentage > 0.3 && legsPercentage > 0.3 && shoesPercentage > 0.3){
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
  const imageData = imageContext.getImageData(x, y, width, height);
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
