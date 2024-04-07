import { MODEL_TYPE,ALEX_MODEL,STEVE_MODEL } from "$data/consts";
import type { FileData, OutfitLayer } from "./common";
import type { OutfitPackageRenderConfig } from "./model";

// Defaults
const defaultOptions = {
  format: "image/png",
  quality: 1,
  width: undefined,
  height: undefined,
  Canvas: undefined,
  crossOrigin: undefined,
};

// Return Promise
let mergeImages = function (
  sources,
  options,
  skinType,
  flatten = true,
  excludefromFlat = ["head"]
): Promise<string> {
  if (sources === void 0) sources = [];
  if (options === void 0) options = {};

  return new Promise(function (resolve) {
    options = Object.assign({}, defaultOptions, options);

    // Setup browser/Node.js specific variables
    var canvas = options.Canvas
      ? new options.Canvas()
      : window.document.createElement("canvas");
    var Image = options.Image || window.Image;

    // Load sources
    var images = sources.map(function (source) {
      return new Promise(function (resolve, reject) {
        // Convert sources to objects
        if (source.constructor.name !== "Object") {
          source = { src: source };
        }

        // Resolve source and img when loaded
        var img = new Image();
        img.crossOrigin = options.crossOrigin;
        img.onerror = function () {
          return reject(new Error("Couldn't load image"));
        };
        img.onload = function () {
          return resolve(Object.assign({}, source, { img: img }));
        };
        img.src = source.src;
      });
    });

    // Get canvas context
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    var tempCanvas = window.document.createElement("canvas");
    var tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });

    // When sources have loaded
    resolve(
      Promise.all(images).then(function (images) {
        // Set canvas dimensions
        var getSize = function (dim) {
          return (
            options[dim] ||
            Math.max.apply(
              Math,
              images.map(function (image) {
                return image.img[dim];
              })
            )
          );
        };
        canvas.width = getSize("width");
        canvas.height = getSize("height");
        let modelMap;
        if (skinType == MODEL_TYPE.ALEX) {
          modelMap = ALEX_MODEL;
        } else {
          modelMap = STEVE_MODEL;
        }
        // Draw images to canvas
        images.forEach(function (image) {
          ctx.globalAlpha = image.opacity ? image.opacity : 1;
          //set temp canvas
          tempCtx.drawImage(image.img, image.x || 0, image.y || 0);
          //update imag

          const k = Object.keys(modelMap);
          for (let i = 0; i < k.length; i++) {
            let part = modelMap[k[i]];
            if (part.outerTextureArea != null && part.textureArea != null)
              replaceLowerPart(tempCtx, ctx, part);
          }

          tempCtx.clearRect(0, 0, canvas.width, canvas.height);

          let drawed = ctx.drawImage(image.img, image.x || 0, image.y || 0);

          return drawed;
        });
        if (flatten) {
          const k = Object.keys(modelMap);
          for (let i = 0; i < k.length; i++) {
            let part = modelMap[k[i]];
            if (
              part.outerTextureArea != null &&
              part.textureArea != null &&
              !excludefromFlat.includes(part.name)
            )
              flatPart(ctx, part);
          }
        }
        // Resolve all other data URIs sync
        return canvas.toDataURL(options.format, options.quality);
      })
    );
  });
};
const replaceLowerPart = function (
  imgContext,
  lowerLayerContext,
  part
) {
  const imageData = imgContext.getImageData(
    part.textureArea.x,
    part.textureArea.y,
    part.textureArea.width,
    part.textureArea.height,
    {
      willReadFrequently: true,
    }
  );
  const sourcePixels = imageData.data;
  const destData = lowerLayerContext.getImageData(
    part.outerTextureArea.x,
    part.outerTextureArea.y,
    part.outerTextureArea.width,
    part.outerTextureArea.height,
    {
      willReadFrequently: true,
    }
  );
  const destPixels = destData.data;
  for (let i = 0; i < sourcePixels.length; i += 4) {
    const r = sourcePixels[i];
    const g = sourcePixels[i + 1];
    const b = sourcePixels[i + 2];
    //detect if is not empty
    if (r != 0 || g != 0 || b != 0) {
      destPixels[i] = 0;
      destPixels[i + 1] = 0;
      destPixels[i + 2] = 0;
      destPixels[i + 3] = 0;
    }
  }
  lowerLayerContext.putImageData(
    destData,
    part.outerTextureArea.x,
    part.outerTextureArea.y
  );
};
const flatPart = function (imgContext, part) {
  const imageData = imgContext.getImageData(
    part.textureArea.x,
    part.textureArea.y,
    part.textureArea.width,
    part.textureArea.height,
    {
      willReadFrequently: true,
    }
  );
  const outerImageData = imgContext.getImageData(
    part.outerTextureArea.x,
    part.outerTextureArea.y,
    part.outerTextureArea.width,
    part.outerTextureArea.height,
    {
      willReadFrequently: true,
    }
  );
  const sourcePixels = outerImageData.data;
  const destPixels = imageData.data;
  for (let i = 0; i < sourcePixels.length; i += 4) {
    const r = sourcePixels[i];
    const g = sourcePixels[i + 1];
    const b = sourcePixels[i + 2];
    //detect if is not empty
    if (r != 0 || g != 0 || b != 0) {
      destPixels[i] = r;
      destPixels[i + 1] = g;
      destPixels[i + 2] = b;
      destPixels[i + 3] = 255;
      //clear outer
      sourcePixels[i] = 0;
      sourcePixels[i + 1] = 0;
      sourcePixels[i + 2] = 0;
      sourcePixels[i + 3] = 0;
    }
  }
  imgContext.putImageData(
    outerImageData,
    part.outerTextureArea.x,
    part.outerTextureArea.y
  );
  imgContext.putImageData(imageData, part.textureArea.x, part.textureArea.y);
};
export const MergeLayersToImage = async function (
  layers: OutfitLayer[],
  config
) {
  return await mergeImages(
    layers.map((x) => x[config.modelType].content).reverse(),
    undefined,
    config.modelType,
    config.flat,
    config.excludedFromFlat
  );
};
export const MergeFileDataToImage = async function (
  layers: FileData[],
  config:OutfitPackageRenderConfig
) {
  return await mergeImages(
    layers.map((x) => x.content).reverse(),
    undefined,
    config.model.name,
    config.isFlatten,
    config.excludedPartsFromFlat
  );
};
export const MergeStringToImage = async function (
  layers: string[],
 config:OutfitPackageRenderConfig
) {
  return await mergeImages(
    layers.reverse(),
    undefined,
    config.model.name,
    config.isFlatten,
    config.excludedPartsFromFlat
  );
};
